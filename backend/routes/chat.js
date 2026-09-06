import express from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const CHAT_MESSAGE_TYPES = { studentFaculty: 'STUDENT_TO_FACULTY', facultyFaculty: 'FACULTY_TO_FACULTY' };

const getChatMessageType = (initiatorRole, targetRole) => {
  if ((initiatorRole === 'student' && targetRole === 'faculty') || (initiatorRole === 'faculty' && targetRole === 'student')) return CHAT_MESSAGE_TYPES.studentFaculty;
  if (initiatorRole === 'faculty' && targetRole === 'faculty') return CHAT_MESSAGE_TYPES.facultyFaculty;
  return null;
};

const canSendMessageInChat = (senderRole, otherRole, messageType) => {
  if (senderRole === 'student') return otherRole === 'faculty' && messageType === CHAT_MESSAGE_TYPES.studentFaculty;
  if (senderRole === 'faculty') {
    if (otherRole === 'student') return messageType === CHAT_MESSAGE_TYPES.studentFaculty;
    if (otherRole === 'faculty') return messageType === CHAT_MESSAGE_TYPES.facultyFaculty;
  }
  return false;
};

const resolveParticipantUser = async (participantId) => {
  const normalized = String(participantId || '').trim();
  if (!normalized) return null;

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    const directUser = await User.findById(normalized);
    if (directUser) return directUser;

    const faculty = await Faculty.findById(normalized).select('email');
    if (faculty?.email) {
      const facultyUser = await User.findOne({ email: faculty.email });
      if (facultyUser) return facultyUser;
    }

    const student = await Student.findById(normalized).select('email');
    if (student?.email) {
      const studentUser = await User.findOne({ email: student.email });
      if (studentUser) return studentUser;
    }
  }

  return User.findOne({ email: normalized.toLowerCase() });
};

// Get all chats for a user. Accepts either User._id, Student/Faculty._id, or email.
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const requestedUser = await resolveParticipantUser(req.params.userId);
    const authenticatedUser = await resolveParticipantUser(req.user?.id);

    if (!requestedUser || !authenticatedUser) return res.status(400).json({ success: false, message: 'Invalid user id' });

    if (req.user?.userType !== 'admin' && requestedUser._id.toString() !== authenticatedUser._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these chats' });
    }

    const chats = await Chat.find({ participants: requestedUser._id })
      .populate('participants', 'name email userType')
      .sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const targetUserId = req.body.facultyId || req.body.participantId;
    if (!['student', 'faculty'].includes(req.user?.userType)) return res.status(403).json({ success: false, message: 'Only students and faculty can initiate chats' });

    const targetUser = await resolveParticipantUser(targetUserId);
    if (!targetUser || !['student', 'faculty'].includes(targetUser.userType)) return res.status(404).json({ success: false, message: 'Participant not found' });
    if (targetUser._id.toString() === req.user.id) return res.status(400).json({ success: false, message: 'Cannot create a chat with yourself' });

    const chatMessageType = getChatMessageType(req.user.userType, targetUser.userType);
    if (!chatMessageType) return res.status(403).json({ success: false, message: 'Student to student chats are not allowed' });

    const existingChat = await Chat.findOne({ participants: { $all: [req.user.id, targetUser._id] }, messageType: chatMessageType });
    if (existingChat) {
      await existingChat.populate('participants', 'name email userType');
      return res.json({ success: true, message: 'Chat already exists', chat: existingChat, existing: true });
    }

    const chat = new Chat({ participants: [req.user.id, targetUser._id], messageType: chatMessageType });
    await chat.save();
    await chat.populate('participants', 'name email userType');
    res.status(201).json({ success: true, message: 'Chat created', chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/:chatId/message', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) return res.status(400).json({ success: false, message: 'Invalid chat id' });
    const { content, tag } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Message content is required' });

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.participants.some((p) => p.toString() === req.user.id)) return res.status(403).json({ success: false, message: 'Not authorized to message in this chat' });

    const otherParticipant = chat.participants.find((p) => p.toString() !== req.user.id);
    const otherUser = await User.findById(otherParticipant).select('userType');
    const messageTag = tag && ['DOUBT', 'GENERAL'].includes(tag) ? tag : 'GENERAL';
    if (!otherUser || !canSendMessageInChat(req.user.userType, otherUser.userType, chat.messageType)) return res.status(403).json({ success: false, message: 'This chat does not allow messages between these user roles' });

    chat.messages.push({ sender: req.user.id, content: content.trim(), tag: messageTag, senderRole: req.user.userType, createdAt: new Date() });
    await chat.save();
    await chat.populate('participants', 'name email userType');
    res.json({ success: true, message: 'Message sent', chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:chatId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) return res.status(400).json({ success: false, message: 'Invalid chat id' });
    if (req.user?.userType !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can modify chat' });
    const chat = await Chat.findByIdAndUpdate(req.params.chatId, req.body, { new: true });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, chat });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:chatId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) return res.status(400).json({ success: false, message: 'Invalid chat id' });
    if (req.user?.userType !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can delete chats' });
    const result = await Chat.findByIdAndDelete(req.params.chatId);
    if (!result) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:chatId/message/:messageId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId) || !mongoose.Types.ObjectId.isValid(req.params.messageId)) return res.status(400).json({ success: false, message: 'Invalid chat or message id' });
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (req.user?.userType !== 'admin' && message.sender.toString() !== req.user?.id) return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    chat.messages = chat.messages.filter((m) => m._id.toString() !== req.params.messageId);
    await chat.save();
    res.json({ success: true, message: 'Message deleted', chat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;

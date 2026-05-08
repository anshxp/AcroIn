import express from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const CHAT_MESSAGE_TYPES = {
  studentFaculty: 'STUDENT_TO_FACULTY',
  facultyFaculty: 'FACULTY_TO_FACULTY',
};

const getChatMessageType = (initiatorRole, targetRole) => {
  if (initiatorRole === 'student' && targetRole === 'faculty') {
    return CHAT_MESSAGE_TYPES.studentFaculty;
  }

  if (initiatorRole === 'faculty' && targetRole === 'student') {
    return CHAT_MESSAGE_TYPES.studentFaculty;
  }

  if (initiatorRole === 'faculty' && targetRole === 'faculty') {
    return CHAT_MESSAGE_TYPES.facultyFaculty;
  }

  return null;
};

const canSendMessageInChat = (senderRole, otherRole, messageType) => {
  if (senderRole === 'student') {
    return otherRole === 'faculty' && messageType === CHAT_MESSAGE_TYPES.studentFaculty;
  }

  if (senderRole === 'faculty') {
    if (otherRole === 'student') {
      return messageType === CHAT_MESSAGE_TYPES.studentFaculty;
    }

    if (otherRole === 'faculty') {
      return messageType === CHAT_MESSAGE_TYPES.facultyFaculty;
    }
  }

  return false;
};

const resolveParticipantUser = async (participantId) => {
  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    return null;
  }

  const directUser = await User.findById(participantId);
  if (directUser) {
    return directUser;
  }

  const facultyProfile = await Faculty.findById(participantId).select('email');
  if (facultyProfile?.email) {
    const facultyUser = await User.findOne({ email: facultyProfile.email });
    if (facultyUser) {
      return facultyUser;
    }
  }

  const studentProfile = await Student.findById(participantId).select('email');
  if (studentProfile?.email) {
    const studentUser = await User.findOne({ email: studentProfile.email });
    if (studentUser) {
      return studentUser;
    }
  }

  return null;
};

// Get all chats for a user
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    // Users can only see their own chats
    if (req.user?.id !== req.params.userId && req.user?.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these chats' });
    }

    const chats = await Chat.find({ participants: req.params.userId })
      .populate('participants', 'name email userType')
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create chat between allowed roles
router.post('/', verifyToken, async (req, res) => {
  try {
    const targetUserId = req.body.facultyId || req.body.participantId;

    if (!['student', 'faculty'].includes(req.user?.userType)) {
      return res.status(403).json({ success: false, message: 'Only students and faculty can initiate chats' });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid participant id' });
    }

    const targetUser = await resolveParticipantUser(targetUserId);
    if (!targetUser || !['student', 'faculty'].includes(targetUser.userType)) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const chatMessageType = getChatMessageType(req.user.userType, targetUser.userType);
    if (!chatMessageType) {
      return res.status(403).json({
        success: false,
        message: 'Student to student chats are not allowed',
      });
    }

    // Check if chat already exists between these roles
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user.id, targetUser._id] },
      messageType: chatMessageType
    });

    if (existingChat) {
      return res.status(400).json({ success: false, message: 'Chat already exists between these participants' });
    }

    const chat = new Chat({
      participants: [req.user.id, targetUser._id],
      messageType: chatMessageType
    });

    await chat.save();
    await chat.populate('participants', 'name email userType');

    res.status(201).json({ success: true, message: 'Chat created', chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Send message (restricted to student->faculty)
router.post('/:chatId/message', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chat id' });
    }

    const { content, tag } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Verify message tag
    const validTags = ['DOUBT', 'GENERAL'];
    const messageTag = tag && validTags.includes(tag) ? tag : 'GENERAL';

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Verify user is a participant
    const isParticipant = chat.participants.some(p => p.toString() === req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to message in this chat' });
    }

    const otherParticipant = chat.participants.find(p => p.toString() !== req.user.id);
    const otherUser = await User.findById(otherParticipant).select('userType');

    if (!otherUser || !canSendMessageInChat(req.user?.userType, otherUser.userType, chat.messageType)) {
      return res.status(403).json({
        success: false,
        message: 'This chat does not allow messages between these user roles',
      });
    }

    // Add message to chat
    chat.messages.push({
      sender: req.user.id,
      content: content.trim(),
      tag: messageTag,
      senderRole: req.user.userType,
      createdAt: new Date()
    });

    await chat.save();
    await chat.populate('participants', 'name email userType');

    res.json({ success: true, message: 'Message sent', chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update chat (e.g., add/remove participants)
router.put('/:chatId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chat id' });
    }

    // Only allow admin to modify chat structure
    if (req.user?.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can modify chat' });
    }

    const chat = await Chat.findByIdAndUpdate(req.params.chatId, req.body, { new: true });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete chat
router.delete('/:chatId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chat id' });
    }

    // Only admin can delete chats
    if (req.user?.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can delete chats' });
    }

    const result = await Chat.findByIdAndDelete(req.params.chatId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete message from chat
router.delete('/:chatId/message/:messageId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chat id' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
      return res.status(400).json({ success: false, message: 'Invalid message id' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Only admin or the message sender can delete
    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (req.user?.userType !== 'admin' && message.sender.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    chat.messages = chat.messages.filter(m => m._id.toString() !== req.params.messageId);
    await chat.save();

    res.json({ success: true, message: 'Message deleted', chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import express from 'express';
import Chat from '../models/Chat.js';
const router = express.Router();

// Get all chats for a user
router.get('/:userId', async (req, res) => {
  const chats = await Chat.find({ participants: req.params.userId });
  res.json(chats);
});

// Create chat
router.post('/', async (req, res) => {
  const { participants, facultyMediator } = req.body;
  const chat = new Chat({ participants, facultyMediator });
  await chat.save();
  res.status(201).json(chat);
});

// Send message
router.post('/:chatId/message', async (req, res) => {
  const { sender, content } = req.body;
  const chat = await Chat.findById(req.params.chatId);
  chat.messages.push({ sender, content });
  await chat.save();
  res.json(chat);
});

// Update chat (e.g., add/remove participants)
router.put('/:chatId', async (req, res) => {
  const chat = await Chat.findByIdAndUpdate(req.params.chatId, req.body, { new: true });
  res.json(chat);
});

// Delete chat
router.delete('/:chatId', async (req, res) => {
  await Chat.findByIdAndDelete(req.params.chatId);
  res.json({ message: 'Chat deleted' });
});

// Delete message from chat
router.delete('/:chatId/message/:messageId', async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  chat.messages = chat.messages.filter(m => m._id.toString() !== req.params.messageId);
  await chat.save();
  res.json(chat);
});

export default router;

import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// Update post
router.put('/:id', async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(post);
});

// Get all posts
router.get('/', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// Create post
router.post('/', async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.status(201).json(post);
});

// Like post
router.post('/:id/like', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (!post.likes.includes(req.body.userId)) post.likes.push(req.body.userId);
  await post.save();
  res.json(post);
});

// Unlike post
router.post('/:id/unlike', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.likes = post.likes.filter(id => id.toString() !== req.body.userId);
  await post.save();
  res.json(post);
});

// Add comment
router.post('/:id/comment', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments.push(req.body);
  await post.save();
  res.json(post);
});

// Delete comment
router.delete('/:id/comment/:commentId', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
  await post.save();
  res.json(post);
});

// Delete post
router.delete('/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: 'Post deleted' });
});

export default router;

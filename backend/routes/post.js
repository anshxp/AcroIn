import express from 'express';
import Post from '../models/Post.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';
import { postUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const FACULTY_ADMIN_ROLES = new Set(['dept_admin', 'super_admin']);

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const isFacultyDepartmentAdmin = (facultyDoc) => (
  Array.isArray(facultyDoc?.role) && facultyDoc.role.some((role) => FACULTY_ADMIN_ROLES.has(role))
);

const getAuthorFromUser = async (userId) => {
  const user = await User.findById(userId).select('email name userType designation department firstname lastName');
  if (!user) {
    return null;
  }

  let profileImage;
  let department = user.department;

  if (user.userType === 'student' && user.email) {
    const student = await Student.findOne({ email: user.email }).select('profile_image department');
    profileImage = student?.profile_image || undefined;
    department = student?.department || department;
  } else if (user.userType === 'faculty' && user.email) {
    const faculty = await Faculty.findOne({ email: user.email }).select('profilepic department');
    profileImage = faculty?.profilepic || undefined;
    department = faculty?.department || department;
  }

  return {
    _id: user._id,
    name: user.name,
    designation: user.designation,
    department,
    profileImage,
    userType: user.userType,
  };
};

const getFacultyAdminContext = async (req) => {
  if (req.user?.userType !== 'faculty' || !req.user?.id) return null;

  const user = await User.findById(req.user.id).select('email name userType');
  if (!user?.email) return null;

  const faculty = await Faculty.findOne({ email: user.email }).select('department role firstname lastName email');
  if (!faculty) return null;

  return {
    user,
    faculty,
    isDepartmentAdmin: isFacultyDepartmentAdmin(faculty),
  };
};

const canFacultyModerateStudentAuthor = (facultyContext, author) => {
  if (!facultyContext?.isDepartmentAdmin) return false;
  if (!author || author.userType !== 'student') return false;

  return normalizeText(author.department) && normalizeText(author.department) === normalizeText(facultyContext.faculty.department);
};

const resolveAuthorDepartment = async (author) => {
  if (!author) return '';

  const directDepartment = String(author.department || '').trim();
  if (directDepartment) return directDepartment;

  if (!author._id || !author.userType) return '';

  const user = await User.findById(author._id).select('email');
  if (!user?.email) return '';

  if (author.userType === 'student') {
    const student = await Student.findOne({ email: user.email }).select('department');
    return student?.department || '';
  }

  if (author.userType === 'faculty') {
    const faculty = await Faculty.findOne({ email: user.email }).select('department');
    return faculty?.department || '';
  }

  return '';
};

const toAbsoluteUploadUrl = (req, filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${req.protocol}://${req.get('host')}${normalized}`;
};

// Update post
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author?._id?.toString() === req.user?.id;
    const isAdminUser = req.user?.userType === 'admin';
    const facultyContext = await getFacultyAdminContext(req);
    const canModerate = canFacultyModerateStudentAuthor(facultyContext, post.author);

    if (!isOwner && !isAdminUser && !canModerate) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { content, images } = req.body || {};
    if (typeof content === 'string') {
      post.content = content;
    }
    if (Array.isArray(images)) {
      post.images = images;
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all posts
router.get('/', verifyToken, async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', verifyToken, isAdminOrFaculty, postUpload.array('files', 4), async (req, res) => {
  try {
    const { content, images } = req.body || {};
    const uploadedMedia = Array.isArray(req.files)
      ? req.files.map((file) => toAbsoluteUploadUrl(req, file.path || `/uploads/${file.filename}`))
      : [];

    const bodyImages = Array.isArray(images)
      ? images.filter((image) => typeof image === 'string' && image.trim())
      : [];

    const normalizedContent = typeof content === 'string' ? content.trim() : '';

    if (!normalizedContent && uploadedMedia.length === 0 && bodyImages.length === 0) {
      return res.status(400).json({ message: 'Post content or at least one file is required' });
    }

    const author = await getAuthorFromUser(req.user.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const post = new Post({
      author,
      content: normalizedContent,
      images: [...bodyImages, ...uploadedMedia],
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like post
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.likes.some((id) => id.toString() === req.user.id)) {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unlike post
router.post('/:id/unlike', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.likes = post.likes.filter((id) => id.toString() !== req.user.id);

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const addCommentHandler = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const author = await getAuthorFromUser(req.user.id);
    if (!author) {
      return res.status(404).json({ message: 'Comment author not found' });
    }

    post.comments.push({ author, content: String(content).trim() });
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add comment (support both /comment and /comments)
router.post('/:id/comment', verifyToken, addCommentHandler);
router.post('/:id/comments', verifyToken, addCommentHandler);

const deleteCommentHandler = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const targetComment = post.comments.find((comment) => comment._id.toString() === req.params.commentId);
    if (!targetComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isCommentOwner = targetComment.author?._id?.toString() === req.user.id;
    const isPostOwner = post.author?._id?.toString() === req.user.id;
    const isAdminUser = req.user?.userType === 'admin';
    const facultyContext = await getFacultyAdminContext(req);
    const commentDepartment = await resolveAuthorDepartment(targetComment.author);
    const canModerate = facultyContext?.isDepartmentAdmin
      && normalizeText(commentDepartment)
      && normalizeText(commentDepartment) === normalizeText(facultyContext.faculty.department);

    if (!isCommentOwner && !isPostOwner && !isAdminUser && !canModerate) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments = post.comments.filter((comment) => comment._id.toString() !== req.params.commentId);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete comment (support both /comment and /comments)
router.delete('/:id/comment/:commentId', verifyToken, deleteCommentHandler);
router.delete('/:id/comments/:commentId', verifyToken, deleteCommentHandler);

// Delete post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author?._id?.toString() === req.user?.id;
    const isAdminUser = req.user?.userType === 'admin';
    const facultyContext = await getFacultyAdminContext(req);
    const canModerate = canFacultyModerateStudentAuthor(facultyContext, post.author);

    if (!isOwner && !isAdminUser && !canModerate) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

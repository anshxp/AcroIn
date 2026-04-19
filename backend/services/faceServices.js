import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

// IMPORTANT:
// This module is an HTTP proxy only.
// Face recognition/enrollment logic runs exclusively in Python at face_rec_service.

const DEFAULT_FACE_API = 'http://127.0.0.1:8000';
const FACE_API = process.env.FACE_REC_SERVICE_URL || DEFAULT_FACE_API;
const FACE_API_KEY = process.env.FACE_API_KEY || '';
const FACE_TIMEOUT_MS = Number(process.env.FACE_API_TIMEOUT_MS || 15000);

const ensurePythonServiceConfigured = () => {
  if (!/^https?:\/\//i.test(FACE_API)) {
    throw new Error('Invalid FACE_REC_SERVICE_URL. Use an absolute URL like http://127.0.0.1:8000.');
  }
};

const mapFaceServiceError = (error, actionLabel) => {
  const backendMessage = error?.response?.data?.detail
    || error?.response?.data?.error
    || error?.response?.data?.message;

  if (backendMessage) {
    return new Error(`Python face_rec_service ${actionLabel} failed: ${backendMessage}`);
  }

  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ECONNABORTED') {
    return new Error(`Python face_rec_service is unreachable during ${actionLabel}. Check FACE_REC_SERVICE_URL and service status.`);
  }

  return new Error(`Python face_rec_service ${actionLabel} failed.`);
};

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || ''));

const appendImageToForm = async (form, fieldName, imageSource) => {
  if (!imageSource) {
    throw new Error(`Missing image source for field: ${fieldName}`);
  }

  if (Buffer.isBuffer(imageSource)) {
    form.append(fieldName, imageSource, {
      filename: `${fieldName}.jpg`,
      contentType: 'image/jpeg',
    });
    return;
  }

  if (typeof imageSource === 'object' && Buffer.isBuffer(imageSource.buffer)) {
    form.append(fieldName, imageSource.buffer, {
      filename: imageSource.originalname || `${fieldName}.jpg`,
      contentType: imageSource.mimetype || 'image/jpeg',
    });
    return;
  }

  if (isHttpUrl(imageSource)) {
    const response = await axios.get(imageSource, { responseType: 'arraybuffer' });
    const ext = path.extname(new URL(imageSource).pathname) || '.jpg';
    form.append(fieldName, Buffer.from(response.data), {
      filename: `${fieldName}${ext}`,
      contentType: response.headers['content-type'] || 'image/jpeg',
    });
    return;
  }

  form.append(fieldName, fs.createReadStream(imageSource));
};

// 🔥 ENROLL
export const enrollFace = async (studentId, frontPath, leftPath, rightPath) => {
  ensurePythonServiceConfigured();

  const form = new FormData();

  form.append("student_id", studentId);

  try {
    await appendImageToForm(form, 'front', frontPath);
    await appendImageToForm(form, 'left', leftPath);
    await appendImageToForm(form, 'right', rightPath);
  } catch (error) {
    throw mapFaceServiceError(error, 'enroll');
  }

  try {
    const res = await axios.post(`${FACE_API}/enroll`, form, {
      timeout: FACE_TIMEOUT_MS,
      headers: {
        ...form.getHeaders(),
        ...(FACE_API_KEY ? { 'x-face-api-key': FACE_API_KEY } : {}),
      },
    });

    if (res.data?.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (error) {
    throw mapFaceServiceError(error, 'enroll');
  }
};

// 🔥 SEARCH
export const searchFace = async (imagePath) => {
  ensurePythonServiceConfigured();

  const form = new FormData();

  try {
    await appendImageToForm(form, 'file', imagePath);
  } catch (error) {
    throw mapFaceServiceError(error, 'search');
  }

  try {
    const res = await axios.post(`${FACE_API}/search`, form, {
      timeout: FACE_TIMEOUT_MS,
      headers: {
        ...form.getHeaders(),
        ...(FACE_API_KEY ? { 'x-face-api-key': FACE_API_KEY } : {}),
      },
    });

    if (res.data?.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (error) {
    throw mapFaceServiceError(error, 'search');
  }
};

export const extractFaceEmbedding = async (imagePath) => {
  ensurePythonServiceConfigured();

  const form = new FormData();

  try {
    await appendImageToForm(form, 'file', imagePath);
  } catch (error) {
    throw mapFaceServiceError(error, 'embed');
  }

  try {
    const res = await axios.post(`${FACE_API}/embed`, form, {
      timeout: FACE_TIMEOUT_MS,
      headers: {
        ...form.getHeaders(),
        ...(FACE_API_KEY ? { 'x-face-api-key': FACE_API_KEY } : {}),
      },
    });

    if (res.data?.error) {
      throw new Error(res.data.error);
    }

    if (!Array.isArray(res.data?.embedding)) {
      throw new Error('Embedding not returned from Python face service.');
    }

    return res.data.embedding;
  } catch (error) {
    throw mapFaceServiceError(error, 'embed');
  }
};
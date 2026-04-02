import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const FACE_API = "http://127.0.0.1:8000";

// 🔥 ENROLL
export const enrollFace = async (studentId, frontPath, leftPath, rightPath) => {
  const form = new FormData();

  form.append("student_id", studentId);
  form.append("front", fs.createReadStream(frontPath));
  form.append("left", fs.createReadStream(leftPath));
  form.append("right", fs.createReadStream(rightPath));

  const res = await axios.post(`${FACE_API}/enroll`, form, {
    headers: form.getHeaders(),
  });

  return res.data;
};

// 🔥 SEARCH
export const searchFace = async (imagePath) => {
  const form = new FormData();

  form.append("file", fs.createReadStream(imagePath));

  const res = await axios.post(`${FACE_API}/search`, form, {
    headers: form.getHeaders(),
  });

  return res.data;
};
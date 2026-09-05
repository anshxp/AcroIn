import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const resolveParams = async (params, req, file) => {
  if (typeof params === 'function') return params(req, file);

  const resolved = {};
  for (const [key, value] of Object.entries(params || {})) {
    resolved[key] = typeof value === 'function' ? await value(req, file) : value;
  }
  return resolved;
};

// Small first-party Multer storage engine. This avoids the legacy
// multer-storage-cloudinary adapter, whose peer dependency is pinned to the
// retired Cloudinary 1.x SDK.
class CloudinaryStorage {
  constructor(options = {}) {
    if (!options.cloudinary) throw new Error('Cloudinary client is required');
    this.cloudinary = options.cloudinary;
    this.params = options.params || {};
  }

  _handleFile(req, file, cb) {
    resolveParams(this.params, req, file)
      .then((params) => {
        const uploadOptions = {
          folder: 'acroin/profiles',
          resource_type: 'auto',
          ...params,
          public_id: params.public_id || `${Date.now()}-${randomUUID()}`,
        };

        const stream = this.cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return cb(error);
            return cb(null, {
              path: result.secure_url || result.url,
              filename: result.public_id,
              size: result.bytes,
              destination: result.asset_folder || uploadOptions.folder,
              cloudinaryResourceType: result.resource_type,
            });
          },
        );

        file.stream.on('error', (error) => stream.destroy(error));
        file.stream.pipe(stream);
      })
      .catch(cb);
  }

  _removeFile(req, file, cb) {
    if (!file?.filename) return cb(null);

    this.cloudinary.uploader.destroy(
      file.filename,
      { resource_type: file.cloudinaryResourceType || 'image' },
      (error) => cb(error || null),
    );
  }
}

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'acroin/profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'pdf'],
      resource_type: 'auto',
    },
  });
} else {
  const uploadsDir = './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  });
}

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const POST_MEDIA_MIMES = [
  ...IMAGE_MIMES,
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
];

const imageFileFilter = (req, file, cb) => {
  if (IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
};

const postMediaFileFilter = (req, file, cb) => {
  if (POST_MEDIA_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const postUpload = multer({
  storage,
  fileFilter: postMediaFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export { cloudinary };
export default upload;

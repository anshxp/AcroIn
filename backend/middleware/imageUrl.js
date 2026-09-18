const IMAGE_FIELDS = new Set(['profile_image', 'cover_image', 'profileImage', 'coverImage']);

const isAbsoluteUrl = (value) => /^(?:https?:)?\/\//i.test(value) || /^(?:data|blob):/i.test(value);

const toPublicImageUrl = (value, req) => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed || isAbsoluteUrl(trimmed)) return trimmed;

  const normalized = trimmed
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');

  const publicPath = normalized.startsWith('uploads/')
    ? `/${normalized}`
    : `/uploads/${normalized}`;

  const baseUrl = `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
  return `${baseUrl}${publicPath}`;
};

const normalizeImageUrls = (value, req, seen = new WeakSet()) => {
  if (Array.isArray(value)) {
    if (seen.has(value)) return value;
    seen.add(value);
    return value.map((item) => normalizeImageUrls(item, req, seen));
  }

  if (!value || typeof value !== 'object') return value;

  // Mongoose documents contain internal/circular properties. Convert them
  // to a plain object before walking response data.
  if (typeof value.toObject === 'function') {
    return normalizeImageUrls(value.toObject(), req, seen);
  }

  // BSON ObjectIds, Dates, Buffers and similar values must be left for
  // JSON.stringify/Mongoose to serialize instead of recursively traversing
  // their internal properties.
  if (
    value?._bsontype ||
    value instanceof Date ||
    Buffer.isBuffer(value)
  ) {
    return value;
  }

  if (seen.has(value)) return value;
  seen.add(value);

  const normalized = {};
  for (const [key, item] of Object.entries(value)) {
    normalized[key] = IMAGE_FIELDS.has(key)
      ? toPublicImageUrl(item, req)
      : normalizeImageUrls(item, req, seen);
  }
  return normalized;
};

export const normalizeImageUrlsMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => originalJson(normalizeImageUrls(body, req));
  next();
};

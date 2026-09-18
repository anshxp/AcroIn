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

const normalizeImageUrls = (value, req) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeImageUrls(item, req));
  }

  if (!value || typeof value !== 'object') return value;

  const normalized = {};
  for (const [key, item] of Object.entries(value)) {
    normalized[key] = IMAGE_FIELDS.has(key)
      ? toPublicImageUrl(item, req)
      : normalizeImageUrls(item, req);
  }
  return normalized;
};

export const normalizeImageUrlsMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => originalJson(normalizeImageUrls(body, req));
  next();
};

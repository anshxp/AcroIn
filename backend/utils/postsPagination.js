/**
 * Parse the optional posts pagination query parameters.
 * A missing or invalid page means legacy unpaginated mode (page 0).
 */
export const parsePostsPagination = (query = {}) => {
  const requestedPage = Number.parseInt(String(query.page ?? ''), 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 0;

  const parsedLimit = Number.parseInt(String(query.limit ?? ''), 10);
  const limit = Math.min(50, Math.max(1, parsedLimit || 20));

  return { page, limit };
};

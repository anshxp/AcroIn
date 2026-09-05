export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: process.env.NODE_ENV === 'production' ? undefined : req.originalUrl,
  });
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
    ? error.statusCode
    : 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  } else if (statusCode >= 500) {
    console.error('[backend] Internal error:', error instanceof Error ? error.message : 'Unknown error');
  }

  const message = statusCode >= 500
    ? 'Internal server error'
    : (error.message || 'Request failed');

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = (err, req, res, next) => {
  console.error('💥', err); // yeh line dikhni chahiye terminal mein

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
};

// middlewares/error-middleware.js
module.exports = (err, req, res, next) => {
  // हमेशा console पर पूरा error दिखाओ (debug के लिए)
  console.error('💥', err);

  // ErrorHandler instance में statusCode होगा; वरना 500 fallback
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // अगर headers भेज चुके हैं तो Express default handler को जाने दो
  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
};

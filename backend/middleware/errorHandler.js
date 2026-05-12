const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Server error'
      : err.message || 'Something went wrong';

  res.status(status).json({
    message
  });
};

module.exports = { errorHandler };

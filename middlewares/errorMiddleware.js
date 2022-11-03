module.exports = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorObject = {
    status,
    message,
  };
  console.error(err);
  res.status(status).json(errorObject);
};

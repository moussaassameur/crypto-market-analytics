const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  const status = err.status || 500;

  logger.error(`${req.method} ${req.originalUrl} -> ${status} : ${err.message}`);

  res.status(status).json({
    error: err.name || "Error",
    message: err.message || "Internal server error",
  });
};

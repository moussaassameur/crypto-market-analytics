const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  logger.error(err.message);

  res.status(err.status || 500).json({
    error: err.name || "Error",
    message: err.message || "Internal server error",
  });
};

const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");

// Chemin ABSOLU vers api/logs
const logsDir = path.resolve(__dirname, "../../logs");

// Créer le dossier logs si absent
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logsDir, "app.log") }),
  ],
});

// Test immédiat au démarrage (tu peux l’enlever après)
logger.log("info", "Logger initialisé (test app.log)");
logger.error("Logger erreur initialisé (test error.log)");

module.exports = logger;

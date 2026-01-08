require("dotenv").config();
const app = require("./app");
const portfolioRepo = require("./repositories/portfolio.repository");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Initialiser les tables au démarrage
const initDatabase = async () => {
  try {
    await portfolioRepo.initTable();
    console.log(" Portfolio table initialized");
  } catch (error) {
    console.error(" Failed to initialize portfolio table:", error.message);
  }
};

initDatabase();

const server = app.listen(PORT, HOST, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(` Port ${PORT} is already in use`);
  } else {
    console.error(" Server error:", error);
  }
  process.exit(1);
});

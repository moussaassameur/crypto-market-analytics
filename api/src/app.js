const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const logger = require("./utils/logger");
const healthRoutes = require("./routes/health.routes");
const dbHealthRoutes = require("./routes/dbHealth.routes");
const cryptoRoutes = require("./routes/crypto.routes");
const priceRoutes = require("./routes/price.routes");
const authRoutes = require("./routes/auth.routes");
const meRoutes = require("./routes/me.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const alertRoutes = require("./routes/alert.routes");
const forecastRoutes = require("./routes/forecast.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Morgan middleware with Winston logger
app.use(
  morgan("combined", {
    stream: {
     write: (message) => logger.log("info", message.trim()),
    },
  })
);

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", dbHealthRoutes);
app.use("/api", priceRoutes);
app.use("/api", cryptoRoutes);
app.use("/api", authRoutes);
app.use("/api", meRoutes);
app.use("/api", portfolioRoutes);
app.use("/api", alertRoutes);
app.use("/api/forecast", forecastRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

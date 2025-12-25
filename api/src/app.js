const express = require("express");
const morgan = require("morgan");

const logger = require("./utils/logger");
const healthRoutes = require("./routes/health.routes");
const dbHealthRoutes = require("./routes/dbHealth.routes");
const cryptoRoutes = require("./routes/crypto.routes");
const priceRoutes = require("./routes/price.routes");
const authRoutes = require("./routes/auth.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");


const app = express();

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;

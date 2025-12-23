const express = require("express");

const healthRoutes = require("./routes/health.routes");
const dbHealthRoutes = require("./routes/dbHealth.routes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", dbHealthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const logger = require("./utils/logger");
const metricsMiddleware = require("./middlewares/metricsMiddleware");
const metricsRoutes = require("./routes/metrics.routes");
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

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Disable X-Powered-By header
app.disable('x-powered-by');

// Rate limiting pour prévenir les attaques ReDoS et DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.',
  standardHeaders: true, // Retourner les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
});

app.use(limiter);

// Middleware de métriques Prometheus
app.use(metricsMiddleware);

// Morgan middleware with Winston logger
app.use(
  morgan("combined", {
    stream: {
     write: (message) => logger.log("info", message.trim()),
    },
  })
);

app.use(express.json());

// Route des métriques Prometheus (sans authentification)
app.use("/metrics", metricsRoutes);

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

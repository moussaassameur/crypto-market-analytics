const express = require('express');

const healthRoutes = require('./routes/health.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/api', healthRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

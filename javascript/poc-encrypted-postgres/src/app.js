const express = require('express');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

module.exports = app;

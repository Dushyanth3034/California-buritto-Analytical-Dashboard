const express = require('express');
const cors = require('cors');
const analyticsRouter = require('./routes/analytics');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api', authMiddleware, analyticsRouter);

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = app;

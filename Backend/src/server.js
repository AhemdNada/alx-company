require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const routes = require('./routes');
const { sseHandler } = require('./sse');
const logger = require('./services/logger');

const app = express();

const { PORT = 4000 } = process.env;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://www.google.com"],
      frameSrc: ["'self'", "https://www.google.com"]
    }
  }
}));

// Allow all origins to support opening frontend from file:// or any host during dev
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Static uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
// Serve Frontend statically for convenience
app.use('/', express.static(path.resolve(__dirname, '../../Frontend')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/stream', sseHandler);
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found'
  });
});

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
  logger.info('Environment:', process.env.NODE_ENV || 'development');
});



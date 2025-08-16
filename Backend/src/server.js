require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { sseHandler } = require('./sse');

const app = express();

const { PORT = 4000 } = process.env;
// Allow all origins to support opening frontend from file:// or any host during dev
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
// Static uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
// Serve Frontend statically for convenience
app.use('/', express.static(path.resolve(__dirname, '../../Frontend')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/stream', sseHandler);
app.use('/api', routes);

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));



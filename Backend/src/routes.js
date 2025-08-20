const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');
const { broadcast } = require('./sse');
const NodeCache = require('node-cache');

const router = Router();
// In-memory cache for lightweight low-latency responses
// TTL 60s, checkperiod 120s. Adjust as needed or swap with Redis in prod.
const newsCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
}

function normalizeDescription(desc) {
  if (desc == null) return null;
  if (typeof desc === 'string') {
    try { return JSON.parse(desc); } catch { return null; }
  }
  if (typeof desc === 'object') return desc;
  return null;
}

// Sharing Rates
router.get('/sharing-rates', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, title, percentage FROM sharing_rates ORDER BY id DESC');
  res.json(rows);
});

router.post('/sharing-rates',
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('percentage').isFloat({ min: 0, max: 100 }),
  validate,
  async (req, res) => {
    const pool = await getPool();
    const { title, percentage } = req.body;
    const [result] = await pool.query('INSERT INTO sharing_rates (title, percentage) VALUES (?, ?)', [title, percentage]);
    const item = { id: result.insertId, title, percentage: Number(percentage) };
    broadcast('sharing_rates:update', { type: 'created', item });
    res.status(201).json(item);
  }
);

router.put('/sharing-rates/:id',
  param('id').isInt({ min: 1 }),
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('percentage').isFloat({ min: 0, max: 100 }),
  validate,
  async (req, res) => {
    const pool = await getPool();
    const { id } = req.params;
    const { title, percentage } = req.body;
    await pool.query('UPDATE sharing_rates SET title=?, percentage=? WHERE id=?', [title, percentage, id]);
    const item = { id: Number(id), title, percentage: Number(percentage) };
    broadcast('sharing_rates:update', { type: 'updated', item });
    res.json(item);
  }
);

router.delete('/sharing-rates/:id', param('id').isInt({ min: 1 }), validate, async (req, res) => {
  const pool = await getPool();
  const { id } = req.params;
  await pool.query('DELETE FROM sharing_rates WHERE id=?', [id]);
  broadcast('sharing_rates:update', { type: 'deleted', id: Number(id) });
  res.status(204).end();
});

// Chairmen
router.get('/chairmen', async (req, res) => {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, name, subtitle, description, image_url as imageUrl, is_featured AS isFeatured FROM chairmen ORDER BY id DESC');
  res.json(rows);
});

// Multer config for uploads
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const base = (req.body.name || req.body.title || 'file').toString();
    const name = base.trim().replace(/[^\w\-]+/g, '_');
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `${name}${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });
const uploadMany = multer({ storage });

router.post('/chairmen',
  upload.single('imageFile'),
  body('name').isString().trim().isLength({ min: 1, max: 255 }),
  body('subtitle').optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('isFeatured').optional().toBoolean(),
  validate,
  async (req, res) => {
    const pool = await getPool();
    const { name, subtitle = null, description = null } = req.body;
    const isFeatured = req.body.isFeatured ? 1 : 0;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      image_url = req.body.imageUrl;
    }
    if (isFeatured) {
      await pool.query('UPDATE chairmen SET is_featured=0');
    }
    const [result] = await pool.query('INSERT INTO chairmen (name, subtitle, description, image_url, is_featured) VALUES (?, ?, ?, ?, ?)', [name, subtitle, description, image_url, isFeatured]);
    const item = { id: result.insertId, name, subtitle, description, imageUrl: image_url, isFeatured: !!isFeatured };
    broadcast('chairmen:update', { type: 'created', item });
    res.status(201).json(item);
  }
);

router.put('/chairmen/:id',
  upload.single('imageFile'),
  param('id').isInt({ min: 1 }),
  body('name').isString().trim().isLength({ min: 1, max: 255 }),
  body('subtitle').optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('isFeatured').optional().toBoolean(),
  validate,
  async (req, res) => {
    const pool = await getPool();
    const { id } = req.params;
    const { name, subtitle = null, description = null } = req.body;
    const isFeatured = req.body.isFeatured ? 1 : 0;

    // Get existing to remove old file if replaced or if removing
    const [[existing]] = await pool.query('SELECT image_url FROM chairmen WHERE id=?', [id]);
    let image_url = existing ? existing.image_url : null;
    if (req.file) {
      // remove previous local file if existed and under /uploads
      if (image_url && image_url.startsWith('/uploads/')) {
        const abs = path.resolve(__dirname, '..', image_url.replace(/^\//, ''));
        fs.existsSync(abs) && fs.unlink(abs, () => {});
      }
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      // if empty string, remove file
      if (!req.body.imageUrl && image_url && image_url.startsWith('/uploads/')) {
        const abs = path.resolve(__dirname, '..', image_url.replace(/^\//, ''));
        fs.existsSync(abs) && fs.unlink(abs, () => {});
      }
      image_url = req.body.imageUrl || null;
    }
    if (isFeatured) {
      await pool.query('UPDATE chairmen SET is_featured=0');
    }
    await pool.query('UPDATE chairmen SET name=?, subtitle=?, description=?, image_url=?, is_featured=? WHERE id=?', [name, subtitle, description, image_url, isFeatured, id]);
    const item = { id: Number(id), name, subtitle, description, imageUrl: image_url, isFeatured: !!isFeatured };
    broadcast('chairmen:update', { type: 'updated', item });
    res.json(item);
  }
);

router.delete('/chairmen/:id', param('id').isInt({ min: 1 }), validate, async (req, res) => {
  const pool = await getPool();
  const { id } = req.params;
  // remove file if local
  const [[existing]] = await pool.query('SELECT image_url FROM chairmen WHERE id=?', [id]);
  if (existing && existing.image_url && existing.image_url.startsWith('/uploads/')) {
    const abs = path.resolve(__dirname, '..', existing.image_url.replace(/^\//, ''));
    fs.existsSync(abs) && fs.unlink(abs, () => {});
  }
  await pool.query('DELETE FROM chairmen WHERE id=?', [id]);
  broadcast('chairmen:update', { type: 'deleted', id: Number(id) });
  res.status(204).end();
});

// News
router.get('/news', async (req, res) => {
  const pool = await getPool();
  // Return news items with first image (if any)
  const [rows] = await pool.query(
    `SELECT n.id, n.title, n.subtitle, n.image_orientation AS imageOrientation, n.created_at AS createdAt, n.updated_at AS updatedAt,
            (SELECT ni.image_url FROM news_images ni WHERE ni.news_id=n.id ORDER BY ni.id ASC LIMIT 1) AS coverImage
     FROM news n
     ORDER BY n.created_at DESC, n.id DESC`
  );
  res.json(rows);
});

// News Ticker Endpoints
router.get('/news/ticker', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, message, created_at AS createdAt FROM news_ticker ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ticker messages' });
  }
});

router.post('/news/ticker',
  body('message').isString().trim().isLength({ min: 1, max: 255 }),
  validate,
  async (req, res) => {
    try {
      const pool = await getPool();
      const { message } = req.body;
      const [result] = await pool.query('INSERT INTO news_ticker (message) VALUES (?)', [message]);
      const item = { id: result.insertId, message, createdAt: new Date() };
      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ error: 'Failed to create ticker message' });
    }
  }
);

router.put('/news/ticker/:id',
  param('id').isInt({ min: 1 }),
  body('message').isString().trim().isLength({ min: 1, max: 255 }),
  validate,
  async (req, res) => {
    try {
      const pool = await getPool();
      const { id } = req.params;
      const { message } = req.body;
      const [existing] = await pool.query('SELECT id FROM news_ticker WHERE id=?', [id]);
      if (!existing.length) return res.status(404).json({ error: 'Message not found' });
      await pool.query('UPDATE news_ticker SET message=? WHERE id=?', [message, id]);
      res.json({ id: Number(id), message });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update ticker message' });
    }
  }
);

router.delete('/news/ticker/:id',
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const pool = await getPool();
      const { id } = req.params;
      const [existing] = await pool.query('SELECT id FROM news_ticker WHERE id=?', [id]);
      if (!existing.length) return res.status(404).json({ error: 'Message not found' });
      await pool.query('DELETE FROM news_ticker WHERE id=?', [id]);
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete ticker message' });
    }
  }
);

router.get('/news/:id', param('id').isInt({ min: 1 }), validate, async (req, res) => {
  const pool = await getPool();
  const { id } = req.params;
  const cacheKey = `news:${id}`;
  const cached = newsCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  const [[item]] = await pool.query(
    'SELECT id, title, subtitle, description, image_orientation AS imageOrientation, created_at AS createdAt, updated_at AS updatedAt FROM news WHERE id=?',
    [id]
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  const [images] = await pool.query('SELECT id, image_url AS imageUrl FROM news_images WHERE news_id=? ORDER BY id ASC', [id]);
  const description = normalizeDescription(item.description);
  const payload = {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    imageOrientation: item.imageOrientation,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    description,
    images
  };
  newsCache.set(cacheKey, payload);
  res.json(payload);
});

router.post(
  '/news',
  uploadMany.array('imageFiles', 20),
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('subtitle').optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body('imageOrientation').isIn(['vertical', 'horizontal']),
  body('descriptionJson').optional({ nullable: true }).isString(),
  validate,
  async (req, res) => {
    const pool = await getPool();
    const { title, subtitle = null, imageOrientation } = req.body;
    let description = null;
    if (req.body.descriptionJson) {
      try {
        const parsed = JSON.parse(req.body.descriptionJson);
        if (!Array.isArray(parsed)) throw new Error('Description must be an array');
        description = JSON.stringify(parsed);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid descriptionJson' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO news (title, subtitle, description, image_orientation) VALUES (?, ?, ?, ?)',
      [title, subtitle, description, imageOrientation]
    );
    const newsId = result.insertId;

    // Build images from uploads and URLs
    const imageUrls = [];
    if (req.files && req.files.length) {
      for (const f of req.files) imageUrls.push(`/uploads/${f.filename}`);
    }
    const rawUrls = req.body['imageUrls[]'] || req.body.imageUrls || req.body.imageUrl;
    if (rawUrls) {
      const urls = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
      for (const u of urls) {
        const url = (u || '').toString().trim();
        if (url) imageUrls.push(url);
      }
    }
    if (imageUrls.length) {
      const values = imageUrls.map((u) => [newsId, u]);
      await pool.query('INSERT INTO news_images (news_id, image_url) VALUES ? ', [values]);
    }

    const [images] = await pool.query('SELECT id, image_url AS imageUrl FROM news_images WHERE news_id=? ORDER BY id ASC', [newsId]);
    const item = {
      id: newsId,
      title,
      subtitle,
      imageOrientation,
      description: normalizeDescription(description),
      images
    };
    broadcast('news:update', { type: 'created', item });
    // populate cache immediately
    newsCache.set(`news:${newsId}`, item);
    res.status(201).json(item);
  }
);

router.put(
  '/news/:id',
  uploadMany.array('imageFiles', 20),
  param('id').isInt({ min: 1 }),
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('subtitle').optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body('imageOrientation').isIn(['vertical', 'horizontal']),
  body('descriptionJson').optional({ nullable: true }).isString(),
  body('existingImageUrlsJson').optional({ nullable: true }).isString(),
  validate,
  async (req, res) => {
    const pool = await getPool();
    const { id } = req.params;
    const { title, subtitle = null, imageOrientation } = req.body;
    let description = null;
    if (req.body.descriptionJson) {
      try {
        const parsed = JSON.parse(req.body.descriptionJson);
        if (!Array.isArray(parsed)) throw new Error('Description must be an array');
        description = JSON.stringify(parsed);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid descriptionJson' });
      }
    }

    // Update main news record
    await pool.query(
      'UPDATE news SET title=?, subtitle=?, description=' + (description === null ? 'description' : '?') + ', image_orientation=? WHERE id=?',
      description === null ? [title, subtitle, imageOrientation, id] : [title, subtitle, description, imageOrientation, id]
    );

    // Manage images: keep some, add new
    const [existing] = await pool.query('SELECT id, image_url FROM news_images WHERE news_id=?', [id]);
    let keepSet = new Set(existing.map((r) => r.image_url));
    if (req.body.existingImageUrlsJson) {
      try {
        const keep = JSON.parse(req.body.existingImageUrlsJson);
        if (Array.isArray(keep)) keepSet = new Set(keep.map((u) => (u || '').toString().trim()).filter(Boolean));
      } catch {}
    }
    // Delete ones not kept
    for (const row of existing) {
      if (!keepSet.has(row.image_url)) {
        // remove local file if under uploads
        if (row.image_url && row.image_url.startsWith('/uploads/')) {
          const abs = path.resolve(__dirname, '..', row.image_url.replace(/^\//, ''));
          fs.existsSync(abs) && fs.unlink(abs, () => {});
        }
        await pool.query('DELETE FROM news_images WHERE id=?', [row.id]);
      }
    }
    // Add new ones
    const imageUrls = [];
    if (req.files && req.files.length) {
      for (const f of req.files) imageUrls.push(`/uploads/${f.filename}`);
    }
    const rawUrls = req.body['imageUrls[]'] || req.body.imageUrls || req.body.imageUrl;
    if (rawUrls) {
      const urls = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
      for (const u of urls) {
        const url = (u || '').toString().trim();
        if (url) imageUrls.push(url);
      }
    }
    if (imageUrls.length) {
      const values = imageUrls.map((u) => [id, u]);
      await pool.query('INSERT INTO news_images (news_id, image_url) VALUES ? ', [values]);
    }

    const [[newsRow]] = await pool.query(
      'SELECT id, title, subtitle, description, image_orientation AS imageOrientation FROM news WHERE id=?',
      [id]
    );
    const [images] = await pool.query('SELECT id, image_url AS imageUrl FROM news_images WHERE news_id=? ORDER BY id ASC', [id]);
    const item = {
      id: Number(id),
      title: newsRow.title,
      subtitle: newsRow.subtitle,
      imageOrientation: newsRow.imageOrientation,
      description: normalizeDescription(newsRow.description),
      images
    };
    broadcast('news:update', { type: 'updated', item });
    // invalidate + set fresh cache
    newsCache.set(`news:${id}`, item);
    res.json(item);
  }
);

router.delete('/news/:id', param('id').isInt({ min: 1 }), validate, async (req, res) => {
  const pool = await getPool();
  const { id } = req.params;
  // remove local image files
  const [images] = await pool.query('SELECT image_url FROM news_images WHERE news_id=?', [id]);
  for (const row of images) {
    if (row.image_url && row.image_url.startsWith('/uploads/')) {
      const abs = path.resolve(__dirname, '..', row.image_url.replace(/^\//, ''));
      fs.existsSync(abs) && fs.unlink(abs, () => {});
    }
  }
  await pool.query('DELETE FROM news WHERE id=?', [id]);
  broadcast('news:update', { type: 'deleted', id: Number(id) });
  newsCache.del(`news:${id}`);
  res.status(204).end();
});

module.exports = router;



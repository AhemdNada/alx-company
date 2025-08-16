const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');
const { broadcast } = require('./sse');

const router = Router();

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
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
    const name = (req.body.name || 'chairman').toString().trim().replace(/[^\w\-]+/g, '_');
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `${name}${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

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

module.exports = router;



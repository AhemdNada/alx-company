const { Router } = require('express');
const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');
const logger = require('../services/logger');

const router = Router();

// Rate limiting for contact form submissions with configurable environment variables
const contactFormLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requests per window default
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent') 
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Validation helper
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contact form submission (public endpoint)
router.post('/submit',
  contactFormLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required and must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s\-'\.]+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
    
    body('email')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Email is required and must be between 1 and 255 characters')
      .matches(emailRegex)
      .withMessage('Please enter a valid email address'),
    
    body('subject')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Subject is required and must be between 1 and 255 characters'),
    
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message is required and must be between 10 and 1000 characters'),
    
    // Optional reCAPTCHA validation
    body('recaptchaToken')
      .optional()
      .isString()
      .withMessage('Invalid reCAPTCHA token')
  ],
  validate,
  async (req, res) => {
    // Verify reCAPTCHA if configured
    if (process.env.RECAPTCHA_SECRET_KEY && req.body.recaptchaToken) {
      try {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: req.body.recaptchaToken,
            remoteip: req.ip
          })
        });

        const recaptchaData = await recaptchaResponse.json();
        
        if (!recaptchaData.success) {
          logger.warn('reCAPTCHA verification failed', { 
            ip: req.ip, 
            errors: recaptchaData['error-codes'] 
          });
          return res.status(400).json({
            success: false,
            message: 'reCAPTCHA verification failed. Please try again.'
          });
        }
      } catch (error) {
        logger.error('reCAPTCHA verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to verify reCAPTCHA. Please try again.'
        });
      }
    }

    await contactController.submitContact(req, res);
  }
);

// Admin endpoints (these would typically be protected with authentication)
router.get('/admin/contacts',
  [
    query('search').optional().isString().trim(),
    query('is_replied').optional().isIn(['true', 'false']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validate,
  contactController.getContacts
);

router.get('/admin/contacts/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid contact ID')
  ],
  validate,
  contactController.getContactById
);

router.put('/admin/contacts/:id/replied',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid contact ID'),
    body('is_replied').isBoolean().withMessage('is_replied must be a boolean')
  ],
  validate,
  contactController.updateRepliedStatus
);

router.delete('/admin/contacts/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid contact ID')
  ],
  validate,
  contactController.deleteContact
);

router.get('/admin/contacts/stats',
  contactController.getContactStats
);

module.exports = router;

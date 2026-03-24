const { body, validationResult } = require('express-validator');

const validateContactSubmission = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  body('company').optional({ checkFalsy: true }).trim(),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('service_interest').trim().notEmpty().withMessage('Please select a service of interest'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters long'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach(err => {
        if (!formattedErrors[err.path]) {
          formattedErrors[err.path] = err.msg;
        }
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: formattedErrors
      });
    }
    next();
  }
];

module.exports = { validateContactSubmission };

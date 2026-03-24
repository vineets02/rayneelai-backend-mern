const express = require('express');
const router = express.Router();
const { validateContactSubmission } = require('../middleware/validateContact');
const { submitContactForm } = require('../controllers/contactController');

router.post('/', validateContactSubmission, submitContactForm);

module.exports = router;

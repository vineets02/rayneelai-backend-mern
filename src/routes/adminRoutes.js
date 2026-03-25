const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const {
  adminLogin,
  getLeads,
  getLeadById,
  updateLead,
  markAsRead,
  markAsContacted,
  addNote,
  archiveLead,
  restoreLead,
  getStats
} = require('../controllers/adminLeadController');

// Public route for admin login
router.post('/login', adminLogin);

// Protected routes (apply adminAuth middleware)
router.use(adminAuth);

// Dashboard stats
router.get('/leads/stats/summary', getStats);

// Lead management operations
router.route('/leads')
  .get(getLeads);

router.route('/leads/:id')
  .get(getLeadById)
  .patch(updateLead)
  .delete(archiveLead); // using semantic delete for archive

router.patch('/leads/:id/read', markAsRead);
router.patch('/leads/:id/contacted', markAsContacted);
router.patch('/leads/:id/restore', restoreLead);
router.post('/leads/:id/notes', addNote);

module.exports = router;

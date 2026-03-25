const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
  getStats
} = require('../controllers/leadsController');
const { protect } = require('../middleware/auth');
const notesRouter = require('./notes');

// Public: contact form submission
router.post('/', createLead);

// Protected: admin dashboard routes
router.get('/analytics/stats', protect, getStats);
router.get('/', protect, getLeads);
router.get('/:id', protect, getLeadById);
router.patch('/:id/status', protect, updateLeadStatus);
router.delete('/:id', protect, deleteLead);

router.use('/:id/notes', notesRouter)

module.exports = router;

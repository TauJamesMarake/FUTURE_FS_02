const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  restoreLead,
  exportLeads,
  getStats,
} = require('../controllers/leadsController');
const { protect } = require('../middleware/auth');
const notesRouter = require('./notes');

// Contact form lead submission
router.post('/', createLead);

// Protected: analytics & export
router.get('/analytics/stats', protect, getStats);
router.get('/export', protect, exportLeads); // export ot CSV or PDF

// Protected: CRUD
router.get('/', protect, getLeads);
router.get('/:id', protect, getLeadById);
router.patch('/:id', protect, updateLead);
router.patch('/:id/status', protect, updateLeadStatus);
router.patch('/:id/restore', protect, restoreLead);
router.delete('/:id', protect, deleteLead);

// Notes
router.use('/:id/notes', notesRouter);

module.exports = router;

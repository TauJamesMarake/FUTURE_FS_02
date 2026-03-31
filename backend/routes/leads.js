const express = require('express');
const router  = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  restoreLead,
  permanentDeleteLead,
  exportLeads,
  getStats,
} = require('../controllers/leadsController');
const { protect }   = require('../middleware/auth');
const notesRouter   = require('./notes');

// Public
router.post('/', createLead);

// analytics & export
router.get('/analytics/stats', protect, getStats);
router.get('/export',          protect, exportLeads);  // ?format=csv|pdf

// CRUD
router.get('/',              protect, getLeads);
router.get('/:id',           protect, getLeadById);
router.patch('/:id',         protect, updateLead);
router.patch('/:id/status',  protect, updateLeadStatus);
router.patch('/:id/restore',    protect, restoreLead);
router.delete('/:id/permanent', protect, permanentDeleteLead);
router.delete('/:id',           protect, deleteLead);


router.use('/:id/notes', notesRouter);

module.exports = router;
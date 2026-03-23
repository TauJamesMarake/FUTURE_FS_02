const express = require('express');
const router  = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
  getStats
} = require('../controllers/leadsController');
const { getNotes, addNote } = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// ── Public ────────────────────────────────────────────────────
router.post('/', createLead);

// ── Analytics — MUST come before /:id to avoid being matched as an id ──
router.get('/analytics/stats', protect, getStats);

// ── Leads CRUD ───────────────────────────────────────────────
router.get('/',               protect, getLeads);
router.get('/:id',            protect, getLeadById);
router.patch('/:id/status',   protect, updateLeadStatus);
router.delete('/:id',         protect, deleteLead);

// ── Notes — nested here so /:id is available via req.params ──
router.get('/:id/notes',  protect, getNotes);
router.post('/:id/notes', protect, addNote);

module.exports = router;

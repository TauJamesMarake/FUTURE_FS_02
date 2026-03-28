const express = require('express');
const router  = express.Router({ mergeParams: true });
const { getNotes, addNote, deleteNote } = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

router.get('/',          protect, getNotes);
router.post('/',         protect, addNote);
router.delete('/:noteId', protect, deleteNote);

module.exports = router;

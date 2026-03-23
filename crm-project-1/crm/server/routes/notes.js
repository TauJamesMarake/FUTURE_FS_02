const express = require('express');
const router  = express.Router({ mergeParams: true }); // inherit :id from parent
const { getNotes, addNote } = require('../controllers/notesController');
const { protect }           = require('../middleware/auth');

router.get('/',  protect, getNotes);
router.post('/', protect, addNote);

module.exports = router;

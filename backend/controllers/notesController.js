const supabase = require('../config/supabase');

/**
 * @route   GET /api/leads/:id/notes
 * @desc    Get all notes for a lead
 * @access  Protected
 */
const getNotes = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });

  res.json({ notes: data });
};

/**
 * @route   POST /api/leads/:id/notes
 * @desc    Add a follow-up note to a lead
 * @access  Protected
 */
const addNote = async (req, res) => {
  const { id } = req.params;
  const { note_text } = req.body;
  const created_by = req.admin?.email || 'admin';

  if (!note_text || note_text.trim() === '') {
    return res.status(400).json({ message: 'Note text is required.' });
  }

  if (note_text.trim().length > 2000) {
    return res.status(400).json({ message: 'Note must be 2000 characters or fewer.' });
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([{ lead_id: id, note_text: note_text.trim(), created_by }])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: 'Note added.', note: data });
};

/**
 * @route   DELETE /api/leads/:id/notes/:noteId
 * @desc    Delete a specific note
 * @access  Protected
 */
const deleteNote = async (req, res) => {
  const { id, noteId } = req.params;

  // Confirms the note belongs to this lead before deleting
  const { data: existing, error: fetchError } = await supabase
    .from('notes')
    .select('id')
    .eq('id', noteId)
    .eq('lead_id', id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ message: 'Note not found for this lead.' });
  }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) return res.status(500).json({ message: error.message });

  res.json({ message: 'Note deleted.' });
};

module.exports = { getNotes, addNote, deleteNote };

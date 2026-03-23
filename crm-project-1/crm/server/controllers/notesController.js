const supabase = require('../config/supabase');

/**
 * GET /api/leads/:id/notes
 * Get all notes for a lead, newest first.
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
 * POST /api/leads/:id/notes
 * Add a follow-up note to a lead.
 */
const addNote = async (req, res) => {
  const { id }        = req.params;
  const { note_text } = req.body;
  const created_by    = req.admin?.email || 'admin';

  if (!note_text || note_text.trim() === '') {
    return res.status(400).json({ message: 'note_text is required.' });
  }

  // Verify the lead exists first
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select('id')
    .eq('id', id)
    .single();

  if (leadErr || !lead) {
    return res.status(404).json({ message: 'Lead not found.' });
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([{ lead_id: id, note_text: note_text.trim(), created_by }])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: 'Note added.', note: data });
};

module.exports = { getNotes, addNote };

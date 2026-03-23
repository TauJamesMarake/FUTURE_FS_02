const supabase = require('../config/supabase');

/**
 * @route   POST /api/leads
 * @desc    Capture a new lead (public endpoint for contact forms)
 * @access  Public
 */
const createLead = async (req, res) => {
  const { name, email, phone, company, source } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([{ name, email, phone, company, source: source || 'website', status: 'new' }])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: 'Lead captured successfully.', lead: data });
};

/**
 * @route   GET /api/leads
 * @desc    Get all leads with optional search and filter params
 * @access  Protected
 * Query params: search, status, source, sort (asc/desc)
 */
const getLeads = async (req, res) => {
  const { search, status, source, sort = 'desc' } = req.query;

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: sort === 'asc' });

  // Filter by status if provided
  if (status) query = query.eq('status', status);

  // Filter by source if provided
  if (source) query = query.eq('source', source);

  // Text search across name, email, company
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });

  res.json({ leads: data, total: data.length });
};

/**
 * @route   GET /api/leads/:id
 * @desc    Get a single lead by ID
 * @access  Protected
 */
const getLeadById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Lead not found.' });

  res.json({ lead: data });
};

/**
 * @route   PATCH /api/leads/:id/status
 * @desc    Update the status of a lead
 * @access  Protected
 */
const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'contacted', 'converted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  if (!data)  return res.status(404).json({ message: 'Lead not found.' });

  res.json({ message: 'Status updated.', lead: data });
};

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Protected
 */
const deleteLead = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ message: error.message });

  res.json({ message: 'Lead deleted successfully.' });
};

/**
 * @route   GET /api/leads/analytics/stats
 * @desc    Return aggregate stats for the dashboard
 * @access  Protected
 */
const getStats = async (req, res) => {
  const { data, error } = await supabase.from('leads').select('status, source, created_at');

  if (error) return res.status(500).json({ message: error.message });

  const total     = data.length;
  const newLeads  = data.filter(l => l.status === 'new').length;
  const contacted = data.filter(l => l.status === 'contacted').length;
  const converted = data.filter(l => l.status === 'converted').length;

  // Leads by source
  const bySource = data.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {});

  // Leads per day (last 7 days)
  const now = new Date();
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = data.filter(l => {
      const created = new Date(l.created_at);
      return created.toDateString() === d.toDateString();
    }).length;
    return { date: label, count };
  });

  res.json({ total, new: newLeads, contacted, converted, bySource, trend });
};

module.exports = { createLead, getLeads, getLeadById, updateLeadStatus, deleteLead, getStats };

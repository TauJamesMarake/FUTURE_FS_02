const supabase = require('../config/supabase');

// ─── Validation helpers ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = ['new', 'contacted', 'converted'];
const VALID_SOURCES  = ['website', 'referral', 'social', 'email', 'other'];

function validateLeadFields({ name, email, phone, source }) {
  const errors = [];
  if (!name  || name.trim().length < 2)      errors.push('Name must be at least 2 characters.');
  if (!email || !EMAIL_RE.test(email.trim())) errors.push('A valid email address is required.');
  if (phone  && !/^\+?[\d\s\-().]{7,20}$/.test(phone)) errors.push('Phone number format is invalid.');
  if (source && !VALID_SOURCES.includes(source)) errors.push(`Source must be one of: ${VALID_SOURCES.join(', ')}.`);
  return errors;
}

// ─── CREATE ────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/leads
 * @desc    Capture a new lead (public endpoint for contact forms)
 * @access  Public
 */
const createLead = async (req, res) => {
  const { name, email, phone, company, source } = req.body;

  const errors = validateLeadFields({ name, email, phone, source });
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { data, error } = await supabase
    .from('leads')
    .insert([{
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      phone:   phone?.trim()   || null,
      company: company?.trim() || null,
      source:  source          || 'website',
      status:  'new',
      deleted_at: null,
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: 'Lead captured successfully.', lead: data });
};

// ─── LIST ──────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/leads
 * @desc    Get all active leads with optional search / filter
 * @access  Protected
 * Query params: search, status, source, sort (asc|desc), include_deleted
 */
const getLeads = async (req, res) => {
  const { search, status, source, sort = 'desc', include_deleted } = req.query;

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: sort === 'asc' });

  // Exclude soft-deleted unless admin explicitly requests them
  if (include_deleted !== 'true') query = query.is('deleted_at', null);

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });

  res.json({ leads: data, total: data.length });
};

// ─── GET ONE ───────────────────────────────────────────────────────────────
/**
 * @route   GET /api/leads/:id
 * @desc    Get a single active lead by ID
 * @access  Protected
 */
const getLeadById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Lead not found.' });

  res.json({ lead: data });
};

// ─── FULL EDIT ─────────────────────────────────────────────────────────────
/**
 * @route   PATCH /api/leads/:id
 * @desc    Update any field(s) of a lead
 * @access  Protected
 */
const updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, source, status } = req.body;

  // Build only the fields that were actually sent
  const patch = {};
  if (name    !== undefined) patch.name    = name.trim();
  if (email   !== undefined) patch.email   = email.trim().toLowerCase();
  if (phone   !== undefined) patch.phone   = phone?.trim() || null;
  if (company !== undefined) patch.company = company?.trim() || null;
  if (source  !== undefined) patch.source  = source;
  if (status  !== undefined) patch.status  = status;

  if (!Object.keys(patch).length) {
    return res.status(400).json({ message: 'No fields provided to update.' });
  }

  // Validate whatever was provided
  const errors = validateLeadFields({
    name:   patch.name   ?? 'placeholder',   // skip name check if not changing
    email:  patch.email  ?? 'a@b.co',        // skip email check if not changing
    phone:  patch.phone,
    source: patch.source,
  });

  // Only surface field-specific errors for fields actually being patched
  const relevant = errors.filter(e => {
    if (e.includes('Name')   && name   === undefined) return false;
    if (e.includes('email')  && email  === undefined) return false;
    if (e.includes('Phone')  && phone  === undefined) return false;
    if (e.includes('Source') && source === undefined) return false;
    return true;
  });
  if (relevant.length) return res.status(400).json({ message: relevant[0], errors: relevant });

  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('leads')
    .update(patch)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  if (!data)  return res.status(404).json({ message: 'Lead not found.' });

  res.json({ message: 'Lead updated.', lead: data });
};

// ─── STATUS ONLY ───────────────────────────────────────────────────────────
/**
 * @route   PATCH /api/leads/:id/status
 * @desc    Update only the status of a lead (kept for backwards compat)
 * @access  Protected
 */
const updateLeadStatus = async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  if (!data)  return res.status(404).json({ message: 'Lead not found.' });

  res.json({ message: 'Status updated.', lead: data });
};

// ─── SOFT DELETE ───────────────────────────────────────────────────────────
/**
 * @route   DELETE /api/leads/:id
 * @desc    Soft-delete a lead (sets deleted_at timestamp, keeps the row)
 * @access  Protected
 */
const deleteLead = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)   // prevent double-delete
    .select('id')
    .single();

  if (error) return res.status(500).json({ message: error.message });
  if (!data)  return res.status(404).json({ message: 'Lead not found or already deleted.' });

  res.json({ message: 'Lead moved to trash.' });
};

/**
 * @route   PATCH /api/leads/:id/restore
 * @desc    Restore a soft-deleted lead
 * @access  Protected
 */
const restoreLead = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('leads')
    .update({ deleted_at: null })
    .eq('id', id)
    .not('deleted_at', 'is', null)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  if (!data)  return res.status(404).json({ message: 'Lead not found in trash.' });

  res.json({ message: 'Lead restored.', lead: data });
};

// ─── EXPORT ────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/leads/export
 * @desc    Export all active leads as CSV or PDF
 * @access  Protected
 * Query params: format=csv|pdf
 */
const exportLeads = async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();

  const { data, error } = await supabase
    .from('leads')
    .select('id, name, email, phone, company, source, status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });

  // ── CSV ──────────────────────────────────────────────────────────────────
  if (format === 'csv') {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Created At'];
    const escape  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = data.map(l => [
      escape(l.id),
      escape(l.name),
      escape(l.email),
      escape(l.phone),
      escape(l.company),
      escape(l.source),
      escape(l.status),
      escape(new Date(l.created_at).toLocaleString()),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
    return res.send(csv);
  }

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (format === 'pdf') {
    // Build a minimal but clean HTML page — Vercel/Railway will render it via
    // the browser's print-to-PDF; no headless Chrome dependency needed on the
    // server.  The client receives HTML with a print-triggered script.
    const rows = data.map(l => `
      <tr>
        <td>${escHtml(l.name)}</td>
        <td>${escHtml(l.email)}</td>
        <td>${escHtml(l.phone)}</td>
        <td>${escHtml(l.company)}</td>
        <td>${escHtml(l.source)}</td>
        <td class="status ${escHtml(l.status)}">${escHtml(l.status)}</td>
        <td>${new Date(l.created_at).toLocaleDateString()}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Leads Export</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;font-size:11px;color:#111;padding:24px}
  h1{font-size:16px;margin-bottom:4px}
  p.sub{color:#666;margin-bottom:16px;font-size:10px}
  table{width:100%;border-collapse:collapse}
  th{background:#1a1a2e;color:#fff;padding:6px 8px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
  td{padding:5px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
  tr:nth-child(even) td{background:#f9fafb}
  .status{font-weight:600;text-transform:capitalize}
  .new{color:#3b82f6}.contacted{color:#f59e0b}.converted{color:#10b981}
  @media print{body{padding:0}}
</style>
</head>
<body>
<h1>LEADit — Leads Export</h1>
<p class="sub">Generated: ${new Date().toLocaleString()} · Total: ${data.length} leads</p>
<table>
  <thead>
    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Source</th><th>Status</th><th>Date</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<script>window.onload=()=>window.print()</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  res.status(400).json({ message: 'format must be "csv" or "pdf".' });
};

/**
 * @route   DELETE /api/leads/:id/permanent
 * @desc    Hard-delete a lead and all its notes (only from Recycle Bin)
 * @access  Protected
 */
const permanentDeleteLead = async (req, res) => {
  const { id } = req.params;

  // Only allow hard-deleting leads that are already soft-deleted
  const { data: existing, error: fetchError } = await supabase
    .from('leads')
    .select('id')
    .eq('id', id)
    .not('deleted_at', 'is', null)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ message: 'Lead not found in trash.' });
  }

  // Delete notes first (foreign key safety)
  await supabase.from('notes').delete().eq('lead_id', id);

  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) return res.status(500).json({ message: error.message });

  res.json({ message: 'Lead permanently deleted.' });
};

function escHtml(v) {
  return String(v ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────────
/**
 * @route   GET /api/leads/analytics/stats
 * @desc    Return aggregate stats for the dashboard (excludes soft-deleted)
 * @access  Protected
 */
const getStats = async (req, res) => {
  const { data, error } = await supabase
    .from('leads')
    .select('status, source, created_at')
    .is('deleted_at', null);

  if (error) return res.status(500).json({ message: error.message });

  const total     = data.length;
  const newLeads  = data.filter(l => l.status === 'new').length;
  const contacted = data.filter(l => l.status === 'contacted').length;
  const converted = data.filter(l => l.status === 'converted').length;

  const bySource = data.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = data.filter(l => new Date(l.created_at).toDateString() === d.toDateString()).length;
    return { date: label, count };
  });

  res.json({ total, new: newLeads, contacted, converted, bySource, trend });
};

module.exports = {
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
};
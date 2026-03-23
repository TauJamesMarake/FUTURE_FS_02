require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// ── Guard: fail fast with readable errors on missing env ─────
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing ${key} in server/.env`);
    console.error('    Copy server/.env.example → server/.env and fill in your values.');
    process.exit(1);
  }
}

const authRoutes  = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
// NOTE: Notes routes are registered INSIDE leadsRoutes (routes/leads.js)
// using router.get('/:id/notes') — do NOT mount them separately here.

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow any localhost port in development ────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// ── Health check — test connectivity before login ─────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/leads', leadsRoutes);

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
);

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀  CRM Server ready at http://localhost:${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/api/health`);
  console.log(`    Supabase: ${process.env.SUPABASE_URL}\n`);
});

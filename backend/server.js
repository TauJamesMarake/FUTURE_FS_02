require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');

//  Guard: fail fast on missing env
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`  Missing ${key} in backend/.env`);
    console.error('    Copy backend/.env.example → backend/.env and fill in your values.');
    process.exit(1);
  }
}

const authRoutes  = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
// mounted notes inside leadsRoutes

const app  = express();
const PORT = process.env.PORT || 5000;

// CORS
const ALLOWED_ORIGINS = new Set([
  process.env.FRONTEND_URL,          // production Vercel URL
  'http://localhost:5173',           // Vite default
  'http://localhost:3000',           // fallback
].filter(Boolean));

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin header) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Rate Limiting

// Global limiter, covers all routes as a baseline
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Strict limiter for the public lead capture endpoint
// Prevents contact-form spam / abuse without blocking the admin
const leadCaptureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,                   // max 30 lead submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many lead submissions from this IP. Please try again later.' },
  // Only count POST /api/leads (public capture), not GET or admin routes
  skip: (req) => req.method !== 'POST',
});

// Strict limiter for auth endpoint, brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Routes
app.use('/api/auth',  authLimiter,        authRoutes);
app.use('/api/leads', leadCaptureLimiter, leadsRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n  CRM Server ready at http://localhost:${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/api/health`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL}`);
  console.log(`   CORS:     ${[...ALLOWED_ORIGINS].join(', ')}\n`);
});

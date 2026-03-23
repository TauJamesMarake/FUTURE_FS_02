require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes  = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const notesRoutes = require('./routes/notes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ── Routes
app.use('/api/auth',          authRoutes);
app.use('/api/leads',         leadsRoutes);
app.use('/api/leads/:id/notes', notesRoutes);

// ── Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 handler 
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// ── Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`🚀 CRM Server running on http://localhost:${PORT}`));

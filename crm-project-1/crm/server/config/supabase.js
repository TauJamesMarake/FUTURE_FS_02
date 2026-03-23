const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in server/.env');
}

// Use service role key so RLS does not block server-side queries
const supabase = createClient(url, key, {
  auth: { persistSession: false }
});

module.exports = supabase;

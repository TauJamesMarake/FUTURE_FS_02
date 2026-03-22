const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for full DB access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;

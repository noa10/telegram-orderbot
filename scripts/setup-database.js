// Script to set up the database schema in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../supabase/migrations/20240520_initial_schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('pgexec', { query: sqlContent });
    
    if (error) {
      console.error('Error setting up database schema:', error);
      process.exit(1);
    }
    
    console.log('Database schema set up successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupDatabase();

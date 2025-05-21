// Script to set up the database schema in Supabase
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase connection parameters
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL or SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { error };
  }
}

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../supabase/migrations/20240520_initial_schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL on Supabase...');
    console.log(`Supabase URL: ${supabaseUrl ? 'Set' : 'Not set'}`);
    console.log(`Supabase Service Key: ${supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Not set'}`);

    // Split the SQL into individual statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        // Use the REST API directly
        const result = await executeSQL(statement);

        if (result.error) {
          console.error(`Error executing statement ${i + 1}:`, result.error);
          // Continue with the next statement instead of exiting
          console.log('Continuing with next statement...');
        }
      } catch (stmtError) {
        console.error(`Exception executing statement ${i + 1}:`, stmtError);
        console.log('Continuing with next statement...');
      }
    }

    console.log('Database schema setup completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the setup function
setupDatabase();

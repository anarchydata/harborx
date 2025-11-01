// Script to run migration via Supabase REST API
// Uses the credentials from .env file

import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Read migration file
const migrationSQL = readFileSync('./supabase/migrations/20250101120000_gpu_instances_and_tests.sql', 'utf8');

console.log('🚀 Running migration via Supabase REST API...');
console.log(`URL: ${SUPABASE_URL}`);

// Execute SQL via REST API
async function runMigration() {
  try {
    // Note: This requires service role key or a custom Edge Function
    // The anon key might not have permissions to execute arbitrary SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        sql: migrationSQL
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Migration completed!', result);
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.log('\n⚠️  Note: Direct SQL execution might require service role key.');
    console.log('   For Lovable projects, migrations might auto-sync from the folder.');
    console.log('   Or use Lovable\'s platform interface to apply migrations.');
    process.exit(1);
  }
}

runMigration();


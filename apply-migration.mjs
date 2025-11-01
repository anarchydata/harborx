// Apply migration using Supabase client from project
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import { config } from 'dotenv';
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gsywfyitbtdbeyylwsvw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

console.log('🔗 Connecting to Supabase...');
console.log(`URL: ${SUPABASE_URL.substring(0, 30)}...`);

// Create Supabase client (using anon key)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read migration SQL
const migrationPath = join(__dirname, 'supabase', 'migrations', '20250101120000_gpu_instances_and_tests.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

async function applyMigration() {
  try {
    console.log('📄 Read migration file');
    console.log(`SQL length: ${migrationSQL.length} characters`);
    
    // Note: Direct SQL execution via REST API typically requires service role key
    // But let's try using the PostgREST API or see if Lovable has special access
    
    // Split into statements (basic parsing)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('create or replace function'))
      .filter(s => !s.toLowerCase().includes('$$')); // Skip function definitions for now

    console.log(`\n📊 Found ${statements.length} statements to execute`);
    console.log('\n⚠️  Note: Executing DDL (CREATE TABLE, etc.) via anon key may not work.');
    console.log('   This typically requires service role key or admin access.\n');

    // Try executing via REST API RPC (if a function exists)
    // Or try direct table operations
    
    // For Lovable, you might need to:
    // 1. Use Lovable's database interface to run SQL
    // 2. Create an Edge Function that has service role access
    // 3. Use the Management API with proper credentials
    
    console.log('💡 For Lovable projects, try one of these:');
    console.log('   1. Check Lovable dashboard for "Database" or "SQL Editor"');
    console.log('   2. Use Lovable\'s deploy/publish to auto-apply migrations');
    console.log('   3. Copy the SQL and run it via Supabase Dashboard SQL Editor');
    console.log('   4. Check if migrations auto-sync from supabase/migrations/ folder\n');
    
    // Try to check if we can at least connect
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('   However, DDL operations require elevated permissions.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

applyMigration();


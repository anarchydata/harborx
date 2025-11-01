// Quick script to verify the migration was successful
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Check if gpu_instances table exists
    const { data: instances, error: instancesError } = await supabase
      .from('gpu_instances')
      .select('*')
      .limit(1);

    if (instancesError) {
      console.log('❌ gpu_instances table:', instancesError.message);
    } else {
      console.log('✅ gpu_instances table exists!');
    }

    // Check if gpu_test_results table exists
    const { data: testResults, error: testResultsError } = await supabase
      .from('gpu_test_results')
      .select('*')
      .limit(1);

    if (testResultsError) {
      console.log('❌ gpu_test_results table:', testResultsError.message);
    } else {
      console.log('✅ gpu_test_results table exists!');
    }

    console.log('\n🎉 Migration verification complete!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:8080');
    console.log('2. Sign up/Sign in as a supplier');
    console.log('3. Complete supplier onboarding');
    console.log('4. Go to Supplier Dashboard → Inventory → "Onboard GPU Instance"');
    console.log('5. Fill in your GPU instance details');

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

verifyMigration();


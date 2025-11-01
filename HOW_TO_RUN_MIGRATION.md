# How to Run Database Migration in Supabase

## Method 1: Using Supabase Dashboard (Easiest - No Setup Required)

1. **Go to your Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the migration:**
   - Open the file: `supabase/migrations/20250101120000_gpu_instances_and_tests.sql`
   - Copy ALL the SQL code (from `CREATE TABLE` to the end)
   - Paste it into the SQL Editor

4. **Run it:**
   - Click "RUN" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for it to complete (should show "Success")

5. **Verify:**
   - Go to "Table Editor" in the left sidebar
   - You should see new tables: `gpu_instances` and `gpu_test_results`

---

## Method 2: Using Supabase CLI (For Developers)

### Step 1: Install Supabase CLI (if not installed)

**On Windows (using PowerShell):**
```powershell
# Option 1: Using Scoop
scoop install supabase

# Option 2: Using npm
npm install -g supabase
```

**On Mac/Linux:**
```bash
# Using Homebrew
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate.

### Step 3: Link Your Project

Get your project reference ID from:
- Supabase Dashboard → Project Settings → General → Reference ID

Then link:
```bash
supabase link --project-ref <your-project-ref-id>
```

For example:
```bash
supabase link --project-ref gsywfyitbtdbeyylwsvw
```

### Step 4: Push Migration
```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations/` folder.

---

## Troubleshooting

### "Relation already exists" error
- This means the tables already exist
- You can either:
  1. Drop them first (be careful!)
  2. Skip this migration if tables already exist

### "Permission denied" error
- Make sure you're logged in with the correct account
- Check that your project reference ID is correct

### "Function does not exist" error
- The migration references `update_updated_at_column()` function
- Make sure the first migration (`20251031180218_18e48144-9144-4d3c-aed4-bca4352d53b9.sql`) was run first
- It should have created this function

---

## What the Migration Creates

The migration creates:

1. **`gpu_instances` table** - Stores GPU instances from any provider
2. **`gpu_test_results` table** - Stores ResNet50 test results
3. **Row Level Security (RLS) policies** - Security rules
4. **Indexes** - For faster queries
5. **Functions** - For auto-calculating compute miles
6. **Triggers** - For automatic timestamp updates

After running, you'll have everything needed for the GPU onboarding system!


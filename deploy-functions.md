# Deploy Supabase Edge Functions

The Edge Functions need to be deployed before they can be used. Here's how:

## Quick Deploy (Using Supabase Dashboard)

1. **Go to Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project (ID: gsywfyitbtdbeyylwsvw)

2. **Go to Edge Functions:**
   - Click "Edge Functions" in the left sidebar
   - Click "Create a new function"

3. **Deploy `onboard-gpu`:**
   - Function name: `onboard-gpu`
   - Copy the contents of `supabase/functions/onboard-gpu/index.ts`
   - Paste it into the editor
   - Click "Deploy"

4. **Deploy `submit-test-results`:**
   - Repeat for `submit-test-results` function
   - Copy from `supabase/functions/submit-test-results/index.ts`

5. **Deploy `request-gpu-test`:**
   - Repeat for `request-gpu-test` function
   - Copy from `supabase/functions/request-gpu-test/index.ts`

## Or Use CLI (Recommended)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
npx supabase login

# Link project (use your project ref from config.toml)
npx supabase link --project-ref gsywfyitbtdbeyylwsvw

# Deploy all functions
npx supabase functions deploy onboard-gpu
npx supabase functions deploy submit-test-results
npx supabase functions deploy request-gpu-test
```

## Verify Deployment

After deployment, try onboarding a GPU again. The error should be resolved.


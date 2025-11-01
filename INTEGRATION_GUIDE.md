# GPU Onboarding Integration Guide

This guide explains how to onboard GPU instances from any provider, run ResNet50 tests, and integrate with the Harborx.ai backend.

## Overview

The system consists of:
1. **Frontend** - React app for managing GPU inventory
2. **Backend** - Supabase Edge Functions for API endpoints
3. **Agent** - Python script that runs on GPU instances to perform tests
4. **Database** - PostgreSQL tables for storing instances and test results

## Prerequisites

1. Supabase project with Edge Functions enabled
2. Python 3.8+ on your GPU instance
3. GPU instance from any provider (with SSH access)

## Setup Steps

### 1. Database Migration

Run the migration to create the necessary tables:
```bash
# The migration file is already created at:
# supabase/migrations/20250101120000_gpu_instances_and_tests.sql

# Apply via Supabase CLI:
supabase db push

# Or apply via Supabase Dashboard > SQL Editor
```

### 2. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Deploy functions
supabase functions deploy onboard-gpu
supabase functions deploy submit-test-results
supabase functions deploy request-gpu-test
```

### 3. Environment Variables

Make sure these are set in your Supabase project:
- `SUPABASE_URL` (automatically set)
- `SUPABASE_ANON_KEY` (automatically set)
- `SUPABASE_SERVICE_ROLE_KEY` (for agent submissions)

### 4. Frontend Setup

The frontend is already integrated. Just make sure your `.env` file has:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Usage Workflow

### Step 1: Onboard GPU Instance

1. **Get your GPU instance details:**
   - Instance ID (from your provider's dashboard)
   - SSH host (hostname or IP address)
   - SSH port (usually 22)
   - GPU name (e.g., "NVIDIA H100")
   - Other details (optional)

2. **In the frontend:**
   - Go to Supplier Dashboard > Inventory tab
   - Click "Onboard GPU Instance" tab
   - Fill in the form:
     - **Required**: Instance ID, SSH Host, GPU Name
     - **Optional**: Offer ID, Machine ID, CUDA version, etc.
   - Click "Onboard GPU"

3. **The system will:**
   - Create a record in `gpu_instances` table
   - Create a corresponding entry in `gpu_inventory` table
   - Set status to "pending"
   - Set test_status to "not_started"

### Step 2: Run Tests on GPU Instance

1. **SSH into your GPU instance:**
   ```bash
   ssh -p <port> root@<ssh_host>
   ```

2. **Upload the agent script:**
   ```bash
   # From your local machine
   scp -P <port> agent/gpu_test_agent.py root@<ssh_host>:/root/
   ```

3. **Run the test agent:**
   ```bash
   # On the GPU instance
   cd /root
   python3 gpu_test_agent.py \
     --gpu-instance-id <your-instance-id-from-db> \
     --api-url https://<your-project>.supabase.co/functions/v1/submit-test-results \
     --api-key <your-service-role-key> \
     --batch-size 32 \
     --num-epochs 1
   ```

   **Get the instance ID:**
   - Check in your database `gpu_instances` table
   - Or use the UUID shown in the frontend after onboarding

   **Get API URL:**
   - Your Supabase URL + `/functions/v1/submit-test-results`

   **Get API Key:**
   - Use your Supabase Service Role Key (from Supabase Dashboard > Settings > API)

4. **The agent will:**
   - Install PyTorch if needed
   - Run ResNet50 benchmark
   - Collect performance metrics:
     - Throughput (samples/sec)
     - Latency (ms/batch)
     - GPU utilization
     - Memory usage
     - Power draw (if available)
     - Temperature (if available)
   - Submit results to backend

### Step 3: View Results

- Results are automatically saved to `gpu_test_results` table
- GPU instance status updates to "active" if test passes
- View in the frontend: Supplier Dashboard > Inventory > GPU Instances

## API Endpoints

### 1. Onboard GPU
```
POST /functions/v1/onboard-gpu
Authorization: Bearer <user-token>
Body: {
  instance_id: string (required)
  ssh_host: string (required)
  gpu_name: string (required)
  ... other optional fields
}
```

### 2. Request Test
```
POST /functions/v1/request-gpu-test
Authorization: Bearer <user-token>
Body: {
  gpu_instance_id: string
}
```

### 3. Submit Test Results (from agent)
```
POST /functions/v1/submit-test-results
x-api-key: <service-role-key>
Body: {
  gpu_instance_id: string
  api_key: string
  throughput_samples_per_sec: number
  latency_ms: number
  ... other metrics
}
```

## Payload Examples

### GPU Instance Onboarding Payload

```json
{
  "instance_id": "12345678",
  "offer_id": "987654",
  "machine_id": "machine-123",
  "ssh_host": "your-gpu-host.com",
  "ssh_port": 22,
  "ssh_user": "root",
  "gpu_name": "NVIDIA H100",
  "gpu_count": 1,
  "cuda_version": "12.1",
  "disk_space_gb": 100,
  "cpu_count": 32
}
```

### Test Results Payload

```json
{
  "gpu_instance_id": "550e8400-e29b-41d4-a716-446655440000",
  "api_key": "your-service-role-key",
  "test_type": "resnet50",
  "batch_size": 32,
  "num_epochs": 1,
  "image_size": 224,
  "throughput_samples_per_sec": 245.5,
  "throughput_images_per_sec": 245.5,
  "latency_ms": 130.2,
  "gpu_utilization_percent": 98.5,
  "memory_used_gb": 45.2,
  "memory_total_gb": 80.0,
  "power_draw_watts": 350.0,
  "temperature_celsius": 65.0,
  "loss": 6.234,
  "test_duration_seconds": 120
}
```

## Database Schema

### `gpu_instances`
- Stores GPU instance details from any provider
- Links to `gpu_inventory`
- Tracks status and test status

### `gpu_test_results`
- Stores ResNet50 benchmark results
- Links to `gpu_instances`
- Contains performance metrics
- Auto-calculates compute miles per hour

### `gpu_inventory`
- General GPU inventory (can be manual or from instances)
- Tracks hours available
- Links to `gpu_instances` if from provider

## Troubleshooting

### Agent fails to connect
- Check SSH credentials
- Verify instance is running and accessible
- Ensure network connectivity

### Agent fails to submit results
- Verify API URL is correct
- Check API key (use service role key)
- Check `gpu_instance_id` matches database

### Tests not showing in frontend
- Refresh the instances list
- Check database directly
- Verify RLS policies allow your user to view results

### Edge Function errors
- Check Supabase logs
- Verify authentication token
- Check function logs in Supabase Dashboard

## Next Steps

After onboarding and testing:
1. Your GPU instances will be marked "active" if tests pass
2. You can view test results and metrics
3. GPUs can be used for marketplace listings
4. Performance metrics are tracked over time

## Security Notes

- **Never commit API keys** to version control
- Use **Service Role Key only on server-side** (agent)
- **Anon Key** is safe for frontend (with RLS)
- SSH keys should be encrypted if stored
- All database queries use **Row Level Security (RLS)**


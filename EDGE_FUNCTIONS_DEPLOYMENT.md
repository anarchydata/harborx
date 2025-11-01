# Supabase Edge Functions for Deployment

You need to deploy **3 Edge Functions** to Supabase:

1. **onboard-gpu** - Handles GPU instance onboarding
2. **submit-test-results** - Receives test results from the agent
3. **request-gpu-test** - Triggers a test request for a GPU instance

---

## Function 1: `onboard-gpu`

**Purpose:** Creates a new GPU instance record in the database when a supplier onboards a GPU.

**Deployment Instructions:**
- Go to Supabase Dashboard → Edge Functions
- Create new function named: `onboard-gpu`
- Paste the code below:

```typescript
// Supabase Edge Function: Onboard GPU Instance
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GPUInstancePayload {
  instance_id: string;
  offer_id?: string;
  machine_id?: string;
  ssh_host: string;
  ssh_port?: number;
  ssh_user?: string;
  ssh_key?: string;
  gpu_name?: string; // Optional - will be auto-detected by agent
  gpu_count?: number; // Optional - will be auto-detected by agent
  cuda_version?: string; // Optional - will be auto-detected by agent
  disk_space_gb?: number; // Optional - will be auto-detected by agent
  cpu_count?: number; // Optional - will be auto-detected by agent
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const payload: GPUInstancePayload = await req.json();

    // Validate required fields
    if (!payload.instance_id || !payload.ssh_host) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: instance_id, ssh_host" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create GPU instance record
    const { data: gpuInstance, error: insertError } = await supabaseClient
      .from("gpu_instances")
      .insert({
        user_id: user.id,
        vast_instance_id: payload.instance_id, // Stored as vast_instance_id for backward compatibility
        vast_offer_id: payload.offer_id, // Provider-specific field
        vast_machine_id: payload.machine_id, // Provider-specific field
        ssh_host: payload.ssh_host,
        ssh_port: payload.ssh_port || 22,
        ssh_user: payload.ssh_user || "root",
        ssh_key: payload.ssh_key,
        gpu_name: payload.gpu_name || "Unknown", // Will be auto-detected by agent
        gpu_count: 1, // Will be auto-detected by agent
        metadata: payload.metadata || {},
        status: "pending",
        test_status: "not_started",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting GPU instance:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optionally create corresponding gpu_inventory entry
    const { data: inventory } = await supabaseClient
      .from("gpu_inventory")
      .insert({
        user_id: user.id,
        gpu_model: payload.gpu_name,
        quantity: payload.gpu_count || 1,
        hours_available: 0,
        status: "inactive",
      })
      .select()
      .single();

    if (inventory) {
      // Link inventory to instance
      await supabaseClient
        .from("gpu_instances")
        .update({ gpu_inventory_id: inventory.id })
        .eq("id", gpuInstance.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        gpu_instance: gpuInstance,
        inventory_id: inventory?.id,
        message: "GPU instance onboarded successfully. Run tests to activate.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in onboard-gpu function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

## Function 2: `submit-test-results`

**Purpose:** Receives test results from the GPU test agent and updates the instance status.

**Deployment Instructions:**
- Go to Supabase Dashboard → Edge Functions
- Create new function named: `submit-test-results`
- Paste the code below:

```typescript
// Supabase Edge Function: Submit GPU Test Results from Agent
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestResultPayload {
  gpu_instance_id: string;
  api_key: string; // API key for authentication (alternative to user auth)
  test_type?: string;
  batch_size?: number;
  num_epochs?: number;
  image_size?: number;
  throughput_images_per_sec?: number;
  throughput_samples_per_sec?: number;
  latency_ms?: number;
  gpu_utilization_percent?: number;
  memory_used_gb?: number;
  memory_total_gb?: number;
  power_draw_watts?: number;
  temperature_celsius?: number;
  accuracy?: number;
  loss?: number;
  test_duration_seconds?: number;
  error_message?: string;
  system_telemetry?: {
    ram_gb?: number;
    cpu_count?: number;
    disk_space_gb?: number;
    gpu_name?: string;
    gpu_count?: number;
    cuda_version?: string;
  };
  raw_results?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body first
    const payload: TestResultPayload = await req.json();
    
    // Get API key from header or body
    const apiKey = req.headers.get("x-api-key") || payload.api_key;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate required fields
    if (!payload.gpu_instance_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: gpu_instance_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role for agent submissions
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get GPU instance to verify ownership
    const { data: gpuInstance, error: instanceError } = await supabaseAdmin
      .from("gpu_instances")
      .select("id, user_id, status, test_status")
      .eq("id", payload.gpu_instance_id)
      .single();

    if (instanceError || !gpuInstance) {
      return new Response(
        JSON.stringify({ error: "GPU instance not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create test result record
    const { data: testResult, error: insertError } = await supabaseAdmin
      .from("gpu_test_results")
      .insert({
        gpu_instance_id: payload.gpu_instance_id,
        user_id: gpuInstance.user_id,
        test_type: payload.test_type || "resnet50",
        batch_size: payload.batch_size || 32,
        num_epochs: payload.num_epochs || 1,
        image_size: payload.image_size || 224,
        throughput_images_per_sec: payload.throughput_images_per_sec,
        throughput_samples_per_sec: payload.throughput_samples_per_sec,
        latency_ms: payload.latency_ms,
        gpu_utilization_percent: payload.gpu_utilization_percent,
        memory_used_gb: payload.memory_used_gb,
        memory_total_gb: payload.memory_total_gb,
        power_draw_watts: payload.power_draw_watts,
        temperature_celsius: payload.temperature_celsius,
        accuracy: payload.accuracy,
        loss: payload.loss,
        test_duration_seconds: payload.test_duration_seconds,
        error_message: payload.error_message,
        raw_results: payload.raw_results || {},
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting test result:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update GPU instance status and telemetry
    const updateData: any = {
      test_status: payload.error_message ? "failed" : "completed",
      tested_at: new Date().toISOString(),
    };

    // Update instance with telemetry data if provided
    if (payload.system_telemetry) {
      const telemetry = payload.system_telemetry;
      if (telemetry.ram_gb) updateData.ram_gb = telemetry.ram_gb;
      if (telemetry.cpu_count) updateData.cpu_count = telemetry.cpu_count;
      if (telemetry.disk_space_gb) updateData.disk_space_gb = telemetry.disk_space_gb;
      if (telemetry.gpu_name) updateData.gpu_name = telemetry.gpu_name;
      if (telemetry.gpu_count) updateData.gpu_count = telemetry.gpu_count;
      if (telemetry.cuda_version) updateData.cuda_version = telemetry.cuda_version;
    }

    if (!payload.error_message && payload.throughput_samples_per_sec) {
      // Mark as active if test passed
      updateData.status = "active";
    }

    await supabaseAdmin
      .from("gpu_instances")
      .update(updateData)
      .eq("id", payload.gpu_instance_id);

    // Update corresponding inventory status if linked
    if (gpuInstance && !payload.error_message) {
      await supabaseAdmin
        .from("gpu_inventory")
        .update({ status: "active" })
        .eq("id", gpuInstance.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        test_result: testResult,
        message: "Test results submitted successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in submit-test-results function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

## Function 3: `request-gpu-test`

**Purpose:** Triggers a test request for a GPU instance (updates status to "testing").

**Deployment Instructions:**
- Go to Supabase Dashboard → Edge Functions
- Create new function named: `request-gpu-test`
- Paste the code below:

```typescript
// Supabase Edge Function: Request GPU Test (trigger test for an instance)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { gpu_instance_id } = await req.json();

    if (!gpu_instance_id) {
      return new Response(
        JSON.stringify({ error: "Missing gpu_instance_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get GPU instance details
    const { data: gpuInstance, error: instanceError } = await supabaseClient
      .from("gpu_instances")
      .select("*")
      .eq("id", gpu_instance_id)
      .eq("user_id", user.id)
      .single();

    if (instanceError || !gpuInstance) {
      return new Response(
        JSON.stringify({ error: "GPU instance not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update status to testing
    await supabaseClient
      .from("gpu_instances")
      .update({
        status: "testing",
        test_status: "running",
      })
      .eq("id", gpu_instance_id);

    // Return connection details for agent (excluding sensitive info)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test requested. Agent can now connect and run tests.",
        connection_info: {
          gpu_instance_id: gpuInstance.id,
          ssh_host: gpuInstance.ssh_host,
          ssh_port: gpuInstance.ssh_port,
          ssh_user: gpuInstance.ssh_user,
          gpu_name: gpuInstance.gpu_name,
        },
        // Include Supabase endpoint for submitting results
        submit_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-test-results`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in request-gpu-test function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

## Summary

Deploy these 3 functions in this order:
1. `onboard-gpu`
2. `submit-test-results`
3. `request-gpu-test`

After deployment, the GPU onboarding feature should work correctly!

## Notes

- All functions require the `gpu_instances` and `gpu_test_results` tables to exist (run the migration first)
- The `submit-test-results` function requires the `SUPABASE_SERVICE_ROLE_KEY` environment variable (automatically set in Supabase)
- All functions handle CORS automatically


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


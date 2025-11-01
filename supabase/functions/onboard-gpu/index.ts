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


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


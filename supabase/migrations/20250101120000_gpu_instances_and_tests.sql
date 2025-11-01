-- Create gpu_instances table for GPU instances from any provider
CREATE TABLE public.gpu_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gpu_inventory_id UUID REFERENCES public.gpu_inventory(id) ON DELETE SET NULL,
  
  -- Provider-specific fields (generalized to work with any provider)
  vast_instance_id TEXT UNIQUE NOT NULL, -- Instance ID from provider
  vast_offer_id TEXT, -- Provider-specific offer/reference ID
  vast_machine_id TEXT, -- Provider-specific machine ID
  
  -- Connection details
  ssh_host TEXT NOT NULL,
  ssh_port INTEGER DEFAULT 22,
  ssh_user TEXT DEFAULT 'root',
  ssh_key TEXT, -- Encrypted SSH key or reference
  
  -- GPU information
  gpu_name TEXT NOT NULL,
  gpu_count INTEGER DEFAULT 1,
  cuda_version TEXT,
  disk_space_gb DECIMAL,
  cpu_count INTEGER,
  ram_gb DECIMAL,
  price_per_hour DECIMAL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'testing', 'active', 'failed', 'offline')),
  test_status TEXT DEFAULT 'not_started' CHECK (test_status IN ('not_started', 'running', 'completed', 'failed')),
  
  -- Metadata
  location TEXT,
  provider TEXT DEFAULT 'custom', -- Provider name (e.g., 'vast.ai', 'aws', 'azure', etc.)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  tested_at TIMESTAMP WITH TIME ZONE
);

-- Create gpu_test_results table for ResNet50 benchmark results
CREATE TABLE public.gpu_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gpu_instance_id UUID NOT NULL REFERENCES public.gpu_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Test configuration
  test_type TEXT NOT NULL DEFAULT 'resnet50' CHECK (test_type IN ('resnet50', 'custom')),
  batch_size INTEGER DEFAULT 32,
  num_epochs INTEGER DEFAULT 1,
  image_size INTEGER DEFAULT 224,
  
  -- Performance metrics
  throughput_images_per_sec DECIMAL,
  throughput_samples_per_sec DECIMAL,
  latency_ms DECIMAL,
  gpu_utilization_percent DECIMAL,
  memory_used_gb DECIMAL,
  memory_total_gb DECIMAL,
  power_draw_watts DECIMAL,
  temperature_celsius DECIMAL,
  
  -- Accuracy/results
  accuracy DECIMAL,
  loss DECIMAL,
  compute_miles_per_hour DECIMAL, -- Calculated metric
  
  -- Test metadata
  test_duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Raw results
  raw_results JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gpu_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpu_test_results ENABLE ROW LEVEL SECURITY;

-- GPU Instances policies
CREATE POLICY "Users can view their own GPU instances"
  ON public.gpu_instances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GPU instances"
  ON public.gpu_instances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GPU instances"
  ON public.gpu_instances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GPU instances"
  ON public.gpu_instances FOR DELETE
  USING (auth.uid() = user_id);

-- GPU Test Results policies
CREATE POLICY "Users can view their own test results"
  ON public.gpu_test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results"
  ON public.gpu_test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
  ON public.gpu_test_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow service role to insert/update (for agent submissions with API key)
CREATE POLICY "Service role can manage test results"
  ON public.gpu_test_results FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_gpu_instances_user_id ON public.gpu_instances(user_id);
CREATE INDEX idx_gpu_instances_vast_instance_id ON public.gpu_instances(vast_instance_id);
CREATE INDEX idx_gpu_instances_status ON public.gpu_instances(status);
CREATE INDEX idx_gpu_test_results_instance_id ON public.gpu_test_results(gpu_instance_id);
CREATE INDEX idx_gpu_test_results_user_id ON public.gpu_test_results(user_id);
CREATE INDEX idx_gpu_test_results_created_at ON public.gpu_test_results(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_gpu_instances_updated_at
  BEFORE UPDATE ON public.gpu_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate compute miles per hour based on throughput
CREATE OR REPLACE FUNCTION calculate_compute_miles(
  throughput_samples_per_sec DECIMAL,
  gpu_model TEXT
) RETURNS DECIMAL AS $$
DECLARE
  base_multiplier DECIMAL;
BEGIN
  -- Base calculation: throughput * model_factor
  -- This is a simplified version - adjust based on your compute mile definition
  CASE 
    WHEN gpu_model LIKE '%H100%' THEN base_multiplier := 1.5;
    WHEN gpu_model LIKE '%A100%' THEN base_multiplier := 1.2;
    WHEN gpu_model LIKE '%H200%' THEN base_multiplier := 1.6;
    ELSE base_multiplier := 1.0;
  END CASE;
  
  RETURN COALESCE(throughput_samples_per_sec * base_multiplier, 0);
END;
$$ LANGUAGE plpgsql;

-- Update test results to auto-calculate compute miles
CREATE OR REPLACE FUNCTION update_compute_miles()
RETURNS TRIGGER AS $$
DECLARE
  gpu_model TEXT;
BEGIN
  SELECT gi.gpu_name INTO gpu_model
  FROM public.gpu_instances gi
  WHERE gi.id = NEW.gpu_instance_id;
  
  IF NEW.throughput_samples_per_sec IS NOT NULL THEN
    NEW.compute_miles_per_hour := calculate_compute_miles(NEW.throughput_samples_per_sec, gpu_model) * 3600;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_compute_miles_trigger
  BEFORE INSERT OR UPDATE ON public.gpu_test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_compute_miles();


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface GPUOnboardingProps {
  onSuccess?: () => void;
}

const GPUOnboarding = ({ onSuccess }: GPUOnboardingProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    instance_id: "",
    offer_id: "",
    machine_id: "",
    ssh_host: "",
    ssh_port: "22",
    ssh_user: "root",
    ssh_key: "",
    gpu_name: "",
    gpu_count: "1",
    cuda_version: "",
    disk_space_gb: "",
    cpu_count: "",
    ram_gb: "",
    price_per_hour: "",
    location: "",
    metadata: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Prepare payload
      const payload: any = {
        instance_id: formData.instance_id,
        ssh_host: formData.ssh_host,
        gpu_name: formData.gpu_name,
      };

      // Add optional fields if provided
      if (formData.offer_id) payload.offer_id = formData.offer_id;
      if (formData.machine_id) payload.machine_id = formData.machine_id;
      if (formData.ssh_port) payload.ssh_port = parseInt(formData.ssh_port);
      if (formData.ssh_user) payload.ssh_user = formData.ssh_user;
      if (formData.ssh_key) payload.ssh_key = formData.ssh_key;
      if (formData.gpu_count) payload.gpu_count = parseInt(formData.gpu_count);
      if (formData.cuda_version) payload.cuda_version = formData.cuda_version;
      if (formData.disk_space_gb) payload.disk_space_gb = parseFloat(formData.disk_space_gb);
      if (formData.cpu_count) payload.cpu_count = parseInt(formData.cpu_count);
      if (formData.ram_gb) payload.ram_gb = parseFloat(formData.ram_gb);
      if (formData.price_per_hour) payload.price_per_hour = parseFloat(formData.price_per_hour);
      if (formData.location) payload.location = formData.location;
      if (formData.metadata) {
        try {
          payload.metadata = JSON.parse(formData.metadata);
        } catch {
          payload.metadata = { notes: formData.metadata };
        }
      }

      // Call Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data, error } = await supabase.functions.invoke("onboard-gpu", {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "GPU Onboarded Successfully",
        description: "Your GPU instance has been added. You can now run tests.",
      });

      // Reset form
      setFormData({
        instance_id: "",
        offer_id: "",
        machine_id: "",
        ssh_host: "",
        ssh_port: "22",
        ssh_user: "root",
        ssh_key: "",
        gpu_name: "",
        gpu_count: "1",
        cuda_version: "",
        disk_space_gb: "",
        cpu_count: "",
        ram_gb: "",
        price_per_hour: "",
        location: "",
        metadata: "",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Error onboarding GPU:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to onboard GPU",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboard GPU Instance</CardTitle>
        <CardDescription>
          Add a GPU instance to your inventory. After onboarding, run tests to activate it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instance_id">Instance ID *</Label>
              <Input
                id="instance_id"
                value={formData.instance_id}
                onChange={(e) => setFormData({ ...formData, instance_id: e.target.value })}
                placeholder="Instance ID from your provider"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssh_host">SSH Host *</Label>
              <Input
                id="ssh_host"
                value={formData.ssh_host}
                onChange={(e) => setFormData({ ...formData, ssh_host: e.target.value })}
                placeholder="SSH hostname or IP address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu_name">GPU Name *</Label>
              <Input
                id="gpu_name"
                value={formData.gpu_name}
                onChange={(e) => setFormData({ ...formData, gpu_name: e.target.value })}
                placeholder="NVIDIA H100, NVIDIA A100, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssh_port">SSH Port</Label>
              <Input
                id="ssh_port"
                type="number"
                value={formData.ssh_port}
                onChange={(e) => setFormData({ ...formData, ssh_port: e.target.value })}
                placeholder="22"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssh_user">SSH User</Label>
              <Input
                id="ssh_user"
                value={formData.ssh_user}
                onChange={(e) => setFormData({ ...formData, ssh_user: e.target.value })}
                placeholder="root"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu_count">GPU Count</Label>
              <Input
                id="gpu_count"
                type="number"
                value={formData.gpu_count}
                onChange={(e) => setFormData({ ...formData, gpu_count: e.target.value })}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer_id">Offer ID</Label>
              <Input
                id="offer_id"
                value={formData.offer_id}
                onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
                placeholder="Offer ID (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="machine_id">Machine ID</Label>
              <Input
                id="machine_id"
                value={formData.machine_id}
                onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                placeholder="Machine ID (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuda_version">CUDA Version</Label>
              <Input
                id="cuda_version"
                value={formData.cuda_version}
                onChange={(e) => setFormData({ ...formData, cuda_version: e.target.value })}
                placeholder="12.1, 11.8, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_hour">Price per Hour ($)</Label>
              <Input
                id="price_per_hour"
                type="number"
                step="0.01"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                placeholder="2.50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="US-East, EU-West, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ram_gb">RAM (GB)</Label>
              <Input
                id="ram_gb"
                type="number"
                value={formData.ram_gb}
                onChange={(e) => setFormData({ ...formData, ram_gb: e.target.value })}
                placeholder="64"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssh_key">SSH Key (optional)</Label>
            <Textarea
              id="ssh_key"
              value={formData.ssh_key}
              onChange={(e) => setFormData({ ...formData, ssh_key: e.target.value })}
              placeholder="Paste SSH private key if needed"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Additional Metadata (JSON, optional)</Label>
            <Textarea
              id="metadata"
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              placeholder='{"custom_field": "value"}'
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Onboard GPU
          </Button>
        </form>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">After onboarding:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>SSH into your GPU instance</li>
            <li>Upload and run the test agent script</li>
            <li>Test results will automatically update the instance status</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPUOnboarding;


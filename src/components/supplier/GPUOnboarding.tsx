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
        gpu_name: "Unknown", // Will be auto-detected by agent
      };

      // Add optional fields if provided
      if (formData.offer_id) payload.offer_id = formData.offer_id;
      if (formData.machine_id) payload.machine_id = formData.machine_id;
      if (formData.ssh_port) payload.ssh_port = parseInt(formData.ssh_port);
      if (formData.ssh_user) payload.ssh_user = formData.ssh_user;
      if (formData.ssh_key) payload.ssh_key = formData.ssh_key;
      if (formData.metadata) {
        try {
          payload.metadata = JSON.parse(formData.metadata);
        } catch {
          payload.metadata = { notes: formData.metadata };
        }
      }

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke("onboard-gpu", {
        body: payload,
      });

      if (error) {
        console.error("Edge Function error:", error);
        
        // Check if function doesn't exist (not deployed)
        if (error.message?.includes("Function not found") || 
            error.message?.includes("404") ||
            error.status === 404) {
          throw new Error(
            "Edge Function 'onboard-gpu' is not deployed. Please deploy it first. " +
            "See deploy-functions.md for instructions."
          );
        }
        
        throw new Error(error.message || `Failed to onboard GPU: ${JSON.stringify(error)}`);
      }

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
          Add a GPU instance to your inventory. Hardware specs will be auto-detected when you run tests.
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


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GPUOnboarding from "./GPUOnboarding";

interface GPUResource {
  id: string;
  gpuType: string;
  totalHours: number;
  availableHours: number;
  status: "active" | "maintenance" | "offline";
}

interface GPUInstance {
  id: string;
  vast_instance_id: string;
  gpu_name: string;
  gpu_count: number;
  status: string;
  test_status: string;
  ssh_host: string;
  created_at: string;
}

const GPUInventory = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<GPUResource[]>([]);
  const [gpuInstances, setGpuInstances] = useState<GPUInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingTest, setIsRequestingTest] = useState<string | null>(null);

  const [newResource, setNewResource] = useState({
    gpuType: "",
    totalHours: "",
  });

  // Load GPU instances from database
  useEffect(() => {
    loadGPUInstances();
  }, []);

  const loadGPUInstances = async () => {
    try {
      const { data, error } = await supabase
        .from("gpu_instances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGpuInstances(data || []);
    } catch (error: any) {
      console.error("Error loading GPU instances:", error);
      toast({
        title: "Error",
        description: "Failed to load GPU instances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestTest = async (instanceId: string) => {
    setIsRequestingTest(instanceId);
    try {
      const { data, error } = await supabase.functions.invoke("request-gpu-test", {
        body: { gpu_instance_id: instanceId },
      });

      if (error) throw error;

      toast({
        title: "Test Requested",
        description: "Test initiated. Run the agent script on your GPU instance.",
      });

      // Reload instances
      loadGPUInstances();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request test",
        variant: "destructive",
      });
    } finally {
      setIsRequestingTest(null);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.gpuType || !newResource.totalHours) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("gpu_inventory")
        .insert({
          user_id: user.id,
          gpu_model: newResource.gpuType,
          quantity: 1,
          hours_available: parseFloat(newResource.totalHours),
          status: "active",
        });

      if (error) throw error;

      toast({
        title: "Resource Added",
        description: `${newResource.gpuType} added successfully`,
      });

      setNewResource({ gpuType: "", totalHours: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add resource",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
    toast({
      title: "Resource Removed",
      description: "GPU resource has been removed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "maintenance": return "secondary";
      case "offline": return "destructive";
      default: return "default";
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="instances" className="w-full">
        <TabsList>
          <TabsTrigger value="instances">GPU Instances</TabsTrigger>
          <TabsTrigger value="onboard">Onboard GPU Instance</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>GPU Instances</CardTitle>
                  <CardDescription>Your onboarded GPU instances</CardDescription>
                </div>
                <Button onClick={loadGPUInstances} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : gpuInstances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No GPU instances found. Onboard a GPU instance to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instance ID</TableHead>
                      <TableHead>GPU Name</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Test Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gpuInstances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-mono text-xs">{instance.vast_instance_id}</TableCell>
                        <TableCell className="font-medium">{instance.gpu_name}</TableCell>
                        <TableCell>{instance.gpu_count}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(instance.status)}>
                            {instance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTestStatusColor(instance.test_status)}>
                            {instance.test_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {instance.test_status === "not_started" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestTest(instance.id)}
                                disabled={isRequestingTest === instance.id}
                              >
                                {isRequestingTest === instance.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboard">
          <GPUOnboarding onSuccess={loadGPUInstances} />
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Add GPU Resource Manually</CardTitle>
              <CardDescription>Add GPU resources manually</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gpuType">GPU Type</Label>
                  <Select
                    value={newResource.gpuType}
                    onValueChange={(value) => setNewResource({ ...newResource, gpuType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GPU type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NVIDIA H100">NVIDIA H100</SelectItem>
                      <SelectItem value="NVIDIA A100">NVIDIA A100</SelectItem>
                      <SelectItem value="NVIDIA A6000">NVIDIA A6000</SelectItem>
                      <SelectItem value="NVIDIA V100">NVIDIA V100</SelectItem>
                      <SelectItem value="NVIDIA RTX 4090">NVIDIA RTX 4090</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalHours">Total Hours Available</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    placeholder="1000"
                    value={newResource.totalHours}
                    onChange={(e) => setNewResource({ ...newResource, totalHours: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddResource} className="w-full">
                  Add Resource
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GPUInventory;

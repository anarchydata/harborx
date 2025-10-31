import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GPUResource {
  id: string;
  gpuType: string;
  totalHours: number;
  availableHours: number;
  status: "active" | "maintenance" | "offline";
}

const GPUInventory = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<GPUResource[]>([
    { id: "1", gpuType: "NVIDIA H100", totalHours: 1000, availableHours: 850, status: "active" },
    { id: "2", gpuType: "NVIDIA A100", totalHours: 2000, availableHours: 1200, status: "active" },
  ]);

  const [newResource, setNewResource] = useState({
    gpuType: "",
    totalHours: "",
  });

  const handleAddResource = () => {
    if (!newResource.gpuType || !newResource.totalHours) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const resource: GPUResource = {
      id: Date.now().toString(),
      gpuType: newResource.gpuType,
      totalHours: parseInt(newResource.totalHours),
      availableHours: parseInt(newResource.totalHours),
      status: "active",
    };

    setResources([...resources, resource]);
    setNewResource({ gpuType: "", totalHours: "" });
    
    toast({
      title: "Resource Added",
      description: `${resource.gpuType} added successfully`,
    });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>GPU Inventory</CardTitle>
              <CardDescription>Manage your available GPU resources</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add GPU Resource</DialogTitle>
                  <DialogDescription>
                    Add new GPU resources to your inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
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
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GPU Type</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Available Hours</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const utilization = ((resource.totalHours - resource.availableHours) / resource.totalHours * 100).toFixed(1);
                return (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.gpuType}</TableCell>
                    <TableCell>{resource.totalHours.toLocaleString()}</TableCell>
                    <TableCell>{resource.availableHours.toLocaleString()}</TableCell>
                    <TableCell>{utilization}%</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(resource.status)}>
                        {resource.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GPUInventory;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

export const BuyerOnboarding = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    contactEmail: "",
    useCase: "",
    gpuPreference: "",
    estimatedHours: "",
    budget: "",
    requirements: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Buyer Registration Submitted",
      description: "Welcome! You can now browse and purchase GPU hours.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Buyer Onboarding</h2>
        <p className="text-sm text-muted-foreground">
          Register as a buyer and access GPU compute resources
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Buyer Information</CardTitle>
              <CardDescription>
                Tell us about your compute requirements
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="buyerCompanyName">Company Name</Label>
                <Input
                  id="buyerCompanyName"
                  placeholder="Your Company Inc"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerContactEmail">Contact Email</Label>
                <Input
                  id="buyerContactEmail"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase">Primary Use Case</Label>
                <Select
                  value={formData.useCase}
                  onValueChange={(value) => setFormData({ ...formData, useCase: value })}
                >
                  <SelectTrigger id="useCase">
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml-training">ML Model Training</SelectItem>
                    <SelectItem value="inference">Inference/Deployment</SelectItem>
                    <SelectItem value="rendering">3D Rendering</SelectItem>
                    <SelectItem value="research">Research & Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpuPreference">GPU Preference</Label>
                <Select
                  value={formData.gpuPreference}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gpuPreference: value })
                  }
                >
                  <SelectTrigger id="gpuPreference">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a100">NVIDIA A100</SelectItem>
                    <SelectItem value="h100">NVIDIA H100</SelectItem>
                    <SelectItem value="mi250">AMD MI250</SelectItem>
                    <SelectItem value="v100">NVIDIA V100</SelectItem>
                    <SelectItem value="any">No Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Monthly Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  placeholder="500"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Describe any specific requirements such as latency, location preferences, compliance needs..."
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-success hover:bg-success/90">
                Complete Registration
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

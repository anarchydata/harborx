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
import { Server } from "lucide-react";

export const SupplierOnboarding = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    contactEmail: "",
    gpuType: "",
    totalHours: "",
    pricePerHour: "",
    location: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Supplier Registration Submitted",
      description: "We'll review your application and get back to you within 24 hours.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Supplier Onboarding</h2>
        <p className="text-sm text-muted-foreground">
          Register as a GPU hours supplier and start trading
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Supplier Information</CardTitle>
              <CardDescription>
                Provide details about your GPU infrastructure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Inc"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
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
                <Label htmlFor="gpuType">GPU Type</Label>
                <Select
                  value={formData.gpuType}
                  onValueChange={(value) => setFormData({ ...formData, gpuType: value })}
                >
                  <SelectTrigger id="gpuType">
                    <SelectValue placeholder="Select GPU type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a100">NVIDIA A100</SelectItem>
                    <SelectItem value="h100">NVIDIA H100</SelectItem>
                    <SelectItem value="mi250">AMD MI250</SelectItem>
                    <SelectItem value="v100">NVIDIA V100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalHours">Total Hours Available</Label>
                <Input
                  id="totalHours"
                  type="number"
                  placeholder="1000"
                  value={formData.totalHours}
                  onChange={(e) =>
                    setFormData({ ...formData, totalHours: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  placeholder="2.50"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerHour: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Data Center Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east">US-East</SelectItem>
                    <SelectItem value="us-west">US-West</SelectItem>
                    <SelectItem value="us-central">US-Central</SelectItem>
                    <SelectItem value="eu-west">EU-West</SelectItem>
                    <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Infrastructure Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your GPU infrastructure, uptime guarantees, and any additional services..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Submit Application
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

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
    // Company Information
    companyName: "",
    legalBusinessName: "",
    businessRegistrationNumber: "",
    taxId: "",
    
    // Contact Information
    contactEmail: "",
    contactPhone: "",
    businessAddress: "",
    
    // Legal/Compliance
    authorizedSignatory: "",
    signatoryTitle: "",
    
    // Data Center Information
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
          <CardTitle>Supplier Registration</CardTitle>
          <CardDescription>
            Complete your supplier registration to list GPU resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Computing Inc."
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalBusinessName">Legal Business Name *</Label>
                  <Input
                    id="legalBusinessName"
                    placeholder="Acme Computing Incorporated"
                    value={formData.legalBusinessName}
                    onChange={(e) =>
                      setFormData({ ...formData, legalBusinessName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessRegistrationNumber">Business Registration Number *</Label>
                  <Input
                    id="businessRegistrationNumber"
                    placeholder="123456789"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, businessRegistrationNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN *</Label>
                  <Input
                    id="taxId"
                    placeholder="12-3456789"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@acme.com"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Input
                    id="businessAddress"
                    placeholder="123 Main St, City, State, ZIP"
                    value={formData.businessAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, businessAddress: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Legal/Compliance Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Authorized Signatory</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorizedSignatory">Full Name *</Label>
                  <Input
                    id="authorizedSignatory"
                    placeholder="John Doe"
                    value={formData.authorizedSignatory}
                    onChange={(e) =>
                      setFormData({ ...formData, authorizedSignatory: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signatoryTitle">Title *</Label>
                  <Input
                    id="signatoryTitle"
                    placeholder="CEO / CTO"
                    value={formData.signatoryTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, signatoryTitle: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Data Center Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Center Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Primary Data Center Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east">US East</SelectItem>
                      <SelectItem value="us-west">US West</SelectItem>
                      <SelectItem value="eu-central">EU Central</SelectItem>
                      <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Infrastructure Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your GPU infrastructure, cooling systems, uptime guarantees, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Complete Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

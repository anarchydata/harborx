import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const SupplierProfile = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "Acme Computing Inc.",
    legalBusinessName: "Acme Computing Incorporated",
    businessRegistrationNumber: "123456789",
    taxId: "12-3456789",
    contactEmail: "contact@acme.com",
    contactPhone: "+1 (555) 123-4567",
    businessAddress: "123 Main St, San Francisco, CA 94105",
    authorizedSignatory: "John Doe",
    signatoryTitle: "CEO",
    location: "US West",
    description: "Enterprise-grade GPU infrastructure with 99.9% uptime guarantee",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your supplier profile has been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Profile</CardTitle>
        <CardDescription>Update your company and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalBusinessName">Legal Business Name</Label>
                <Input
                  id="legalBusinessName"
                  value={formData.legalBusinessName}
                  onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
                <Input
                  id="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Authorized Signatory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorizedSignatory">Full Name</Label>
                <Input
                  id="authorizedSignatory"
                  value={formData.authorizedSignatory}
                  onChange={(e) => setFormData({ ...formData, authorizedSignatory: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatoryTitle">Title</Label>
                <Input
                  id="signatoryTitle"
                  value={formData.signatoryTitle}
                  onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Center Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Primary Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Infrastructure Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplierProfile;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import GPUInventory from "@/components/supplier/GPUInventory";
import PerformanceMetrics from "@/components/supplier/PerformanceMetrics";
import SupplierProfile from "@/components/supplier/SupplierProfile";
import AgentSetup from "@/components/supplier/AgentSetup";

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your GPU resources</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Status: Active
              </Badge>
              <Button variant="outline">Support</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="agent">Agent Setup</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <GPUInventory />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="agent" className="space-y-6">
            <AgentSetup />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <SupplierProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SupplierDashboard;

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { OrderBook } from "@/components/dashboard/OrderBook";
import { SupplierOnboarding } from "@/components/onboarding/SupplierOnboarding";
import { BuyerOnboarding } from "@/components/onboarding/BuyerOnboarding";
import { Cpu, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("market");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">GPU Trade Desk</h1>
              <p className="text-xs text-muted-foreground">Commodity Trading Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Market Status: Live
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-secondary">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="supplier">Supplier</TabsTrigger>
            <TabsTrigger value="buyer">Buyer</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderBook />
          </TabsContent>

          <TabsContent value="supplier" className="space-y-6">
            <SupplierOnboarding />
          </TabsContent>

          <TabsContent value="buyer" className="space-y-6">
            <BuyerOnboarding />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

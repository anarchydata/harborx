import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { OrderBook } from "@/components/dashboard/OrderBook";
import { BuyerOnboarding } from "@/components/onboarding/BuyerOnboarding";
import { Cpu, TrendingUp, UserPlus, ShoppingCart, ShoppingBag } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("market");
  const [buyerDialogOpen, setBuyerDialogOpen] = useState(false);

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
              <p className="text-xs text-muted-foreground">Class B Compute Trading</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Buy Now at Spot
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Market Status: Beta
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/auth")}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Supplier Sign In
            </Button>
            <Dialog open={buyerDialogOpen} onOpenChange={setBuyerDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buyer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Buyer Onboarding</DialogTitle>
                </DialogHeader>
                <BuyerOnboarding />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6">
            <MarketOverview />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderBook />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

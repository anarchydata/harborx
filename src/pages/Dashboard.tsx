import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { OrderBook } from "@/components/dashboard/OrderBook";
import { BuyerOnboarding } from "@/components/onboarding/BuyerOnboarding";
import { Anchor, TrendingUp, UserPlus, ShoppingCart, ShoppingBag } from "lucide-react";
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("market");
  const [buyerDialogOpen, setBuyerDialogOpen] = useState(false);
  return <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10">
              <Anchor className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold text-foreground">HarborX.ai</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Anchoring the Global Market for Compute</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button size="sm" className="gap-2 hidden sm:flex">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">Buy Now at Spot</span>
            </Button>
            <div className="flex items-center gap-2 text-sm border border-border rounded-md px-3 py-1.5 bg-secondary/50">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground hidden sm:inline">Market Status: Beta</span>
              <span className="text-foreground sm:hidden">Beta</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="hidden md:flex">
              <UserPlus className="mr-2 h-4 w-4" />
              Supplier Sign In
            </Button>
            <Dialog open={buyerDialogOpen} onOpenChange={setBuyerDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Buyer</span>
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
    </div>;
};
export default Dashboard;
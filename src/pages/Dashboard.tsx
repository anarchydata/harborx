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
      <header className="border-b border-border bg-card px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
              <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h1 className="text-base sm:text-xl font-bold text-foreground">Harborx.ai</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
            <Button size="sm" className="gap-1 sm:gap-2 hidden sm:flex text-xs sm:text-sm">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Buy Now at Spot</span>
            </Button>
            <div className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Market Status: Beta</span>
              <span className="sm:hidden">Beta</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="hidden md:flex text-xs sm:text-sm">
              <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Supplier Sign In
            </Button>
            <Dialog open={buyerDialogOpen} onOpenChange={setBuyerDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs sm:text-sm">
                  <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
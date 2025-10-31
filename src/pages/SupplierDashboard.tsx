import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import GPUInventory from "@/components/supplier/GPUInventory";
import PerformanceMetrics from "@/components/supplier/PerformanceMetrics";
import SupplierProfile from "@/components/supplier/SupplierProfile";
import AgentSetup from "@/components/supplier/AgentSetup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserEmail(session.user.email || "");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserEmail(session.user.email || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your GPU resources</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Status: Active
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
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

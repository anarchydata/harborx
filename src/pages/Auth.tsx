import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Check if user is already logged in
    // Only auto-redirect if they just signed in, not if they manually navigated here
    const urlParams = new URLSearchParams(window.location.search);
    const fromOnboarding = urlParams.get('from') === 'onboarding';
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If user manually came from onboarding page, don't auto-redirect
      // They might want to logout or switch accounts
      if (session && !fromOnboarding) {
        // Check if they have a supplier profile
        supabase.from("supplier_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            // If they have a profile, redirect to supplier dashboard
            // Otherwise, they might be completing onboarding
            if (data) {
              navigate("/supplier");
            }
          });
      }
    });

    // Listen for auth changes (only redirect on sign in, not manual navigation)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Read URL parameter dynamically to avoid stale closure
      const currentUrlParams = new URLSearchParams(window.location.search);
      const currentFromOnboarding = currentUrlParams.get('from') === 'onboarding';
      
      // Only auto-redirect on sign in, not on manual page visits
      if (session && event === "SIGNED_IN" && !currentFromOnboarding) {
        // Check if user has a supplier profile
        const { data: profile } = await supabase
          .from("supplier_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile) {
          navigate("/supplier");
        } else {
          navigate("/supplier-onboarding");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/supplier-onboarding`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Account created!",
          description: "You can now log in to start your supplier onboarding.",
        });
      }
    } catch (error: any) {
      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if this is admin credentials and handle accordingly
      if (email === "admin@harborx.ai" && password === "admin123") {
        await handleAdminLoginDirect();
        // If navigation happened, component may be unmounting
        if (!isMountedRef.current) {
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If account doesn't exist and it's admin, try to create it
        if (error.message.includes("Invalid login credentials") && email === "admin@harborx.ai") {
          await handleAdminLoginDirect();
          // If navigation happened, component may be unmounting
          if (!isMountedRef.current) {
            return;
          }
        }
        throw error;
      }

      if (data && data.session) {
        // Check if user has a supplier profile to determine redirect
        const { data: profile } = await supabase
          .from("supplier_profiles")
          .select("id")
          .eq("user_id", data.session.user.id)
          .single();
        
        // Only show toast if component is still mounted
        if (isMountedRef.current) {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
        }
        
        // Redirect based on whether they have a profile
        if (profile) {
          navigate("/supplier");
        } else {
          navigate("/supplier-onboarding");
        }
        
        // If navigation happened, component may be unmounting
        if (!isMountedRef.current) {
          return;
        }
      }
    } catch (error: any) {
      // Only show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleAdminLoginDirect = async () => {
    const adminEmail = "admin@harborx.ai";
    const adminPassword = "admin123";

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInData && signInData.session) {
      // Check if admin has a supplier profile
      const { data: profile } = await supabase
        .from("supplier_profiles")
        .select("id")
        .eq("user_id", signInData.session.user.id)
        .single();
      
      toast({
        title: "Admin Login",
        description: "Logged in as admin for testing.",
      });
      
      // Redirect based on whether they have a profile
      if (profile) {
        navigate("/supplier");
      } else {
        navigate("/supplier-onboarding");
      }
      return;
    }

    // If sign in failed, try to create the account
    if (signInError && signInError.message.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/supplier-onboarding`,
        },
      });

      if (signUpError) {
        // Check if account exists but email is not confirmed
        if (signUpError.message.includes("already registered") || signUpError.message.includes("User already registered")) {
          throw new Error("Admin account exists but email may not be confirmed. Please check your email or disable email confirmation in Supabase settings.");
        }
        throw signUpError;
      }

      if (signUpData.session) {
        // Successfully signed up and got session (if email confirmation is disabled)
        toast({
          title: "Admin Account Created",
          description: "Logged in as admin for testing.",
        });
        
        // Redirect to onboarding since this is a new account
        navigate("/supplier-onboarding");
      } else {
        // Email confirmation required - try signing in anyway in case it works
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (retryData && retryData.session) {
          toast({
            title: "Admin Login",
            description: "Logged in as admin for testing.",
          });
          
          // Check if admin has a supplier profile
          const { data: profile } = await supabase
            .from("supplier_profiles")
            .select("id")
            .eq("user_id", retryData.session.user.id)
            .single();
          
          if (profile) {
            navigate("/supplier");
          } else {
            navigate("/supplier-onboarding");
          }
        } else {
          throw new Error("Admin account created. Email confirmation may be required. Please check Supabase settings to disable email confirmation for development.");
        }
      }
    } else {
      throw signInError || new Error("Failed to login as admin");
    }
  };

  useEffect(() => {
    // Track mount state to prevent state updates on unmounted component
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      // Pre-fill the form with admin credentials
      setEmail("admin@harborx.ai");
      setPassword("admin123");
      
      // Call the direct admin login handler
      await handleAdminLoginDirect();
      
      // If navigation happened, component may be unmounting
      // Don't set loading state if component is unmounted
      if (!isMountedRef.current) {
        return;
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      // Only update state and show toast if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: error.message || "Failed to login as admin. You may need to manually create the admin account or disable email confirmation in Supabase settings.",
          variant: "destructive",
        });
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>GPU Marketplace</CardTitle>
          <CardDescription>Sign in or create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleAdminLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Admin Login (Testing)"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle, AlertCircle, RefreshCw, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AgentSetup = () => {
  const { toast } = useToast();
  const [agentStatus, setAgentStatus] = useState<"not-installed" | "installed" | "running">("not-installed");

  const handleDownloadAgent = () => {
    toast({
      title: "Agent Download Started",
      description: "GPU monitoring agent installer is being downloaded",
    });
    // In production, this would trigger actual download
    setTimeout(() => {
      setAgentStatus("installed");
    }, 2000);
  };

  const handleTestConnection = () => {
    toast({
      title: "Testing Connection",
      description: "Verifying agent connectivity...",
    });
    setTimeout(() => {
      setAgentStatus("running");
      toast({
        title: "Connection Successful",
        description: "Agent is reporting metrics correctly",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Setup</CardTitle>
              <CardDescription>Install and configure the GPU monitoring agent</CardDescription>
            </div>
            <Badge variant={agentStatus === "running" ? "default" : "secondary"}>
              {agentStatus === "running" ? "Active" : agentStatus === "installed" ? "Installed" : "Not Installed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {agentStatus === "not-installed" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The monitoring agent needs to be installed on your GPU machines to track compute availability and performance metrics.
              </AlertDescription>
            </Alert>
          )}

          {agentStatus === "installed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Agent installed successfully. Test the connection to start reporting metrics.
              </AlertDescription>
            </Alert>
          )}

          {agentStatus === "running" && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Agent is running and reporting metrics successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold">Installation Steps</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Download the agent installer for your operating system</li>
                  <li>Run the installer with administrator/root privileges</li>
                  <li>Configure your API key during installation</li>
                  <li>Test the connection to verify proper setup</li>
                  <li>Agent will automatically report metrics every 5 minutes</li>
                </ol>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Linux</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs bg-muted p-2 rounded block mb-4">
                    curl -O https://agent.tradedesk.com/linux
                    <br />
                    sudo bash install.sh
                  </code>
                  <Button onClick={handleDownloadAgent} disabled={agentStatus !== "not-installed"} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for Linux
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Windows</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs bg-muted p-2 rounded block mb-4">
                    Download and run installer.exe
                    <br />
                    Follow setup wizard
                  </code>
                  <Button onClick={handleDownloadAgent} disabled={agentStatus !== "not-installed"} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for Windows
                  </Button>
                </CardContent>
              </Card>
            </div>

            {agentStatus === "installed" && (
              <Button onClick={handleTestConnection} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            )}

            {agentStatus === "running" && (
              <div className="space-y-3">
                <h4 className="font-semibold">Agent Configuration</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Reporting Interval</span>
                    <span className="font-medium">5 minutes</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Last Report</span>
                    <span className="font-medium">2 minutes ago</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Metrics Collected</span>
                    <span className="font-medium">GPU utilization, compute miles/hr</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Use this key to configure your agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
              sk_live_abc123xyz789def456ghi012jkl345mno678
            </code>
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText("sk_live_abc123xyz789def456ghi012jkl345mno678");
              toast({ title: "Copied", description: "API key copied to clipboard" });
            }}>
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSetup;

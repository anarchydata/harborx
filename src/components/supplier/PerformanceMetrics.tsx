import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, Clock, DollarSign } from "lucide-react";

const PerformanceMetrics = () => {
  const uptimeData = [
    { date: "Jan", uptime: 99.8 },
    { date: "Feb", uptime: 99.9 },
    { date: "Mar", uptime: 99.7 },
    { date: "Apr", uptime: 99.9 },
    { date: "May", uptime: 100 },
    { date: "Jun", uptime: 99.8 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 12400 },
    { month: "Feb", revenue: 14800 },
    { month: "Mar", revenue: 16200 },
    { month: "Apr", revenue: 18900 },
    { month: "May", revenue: 21500 },
    { month: "Jun", revenue: 19800 },
  ];

  const metrics = [
    {
      title: "Uptime",
      value: "99.8%",
      change: "+0.2%",
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Total Revenue",
      value: "$103,600",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      title: "Hours Sold",
      value: "8,450",
      change: "+8.3%",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Avg. Utilization",
      value: "84.2%",
      change: "+5.1%",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uptime Performance</CardTitle>
            <CardDescription>Last 6 months uptime percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[99, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue from GPU hours sold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Machine Status</CardTitle>
          <CardDescription>Real-time status of your GPU machines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "GPU-001", type: "NVIDIA H100", status: "Running", uptime: "99.9%", computeMiles: "1,245" },
              { id: "GPU-002", type: "NVIDIA H100", status: "Running", uptime: "99.8%", computeMiles: "1,189" },
              { id: "GPU-003", type: "NVIDIA A100", status: "Running", uptime: "100%", computeMiles: "2,456" },
              { id: "GPU-004", type: "NVIDIA A100", status: "Maintenance", uptime: "98.2%", computeMiles: "2,103" },
            ].map((machine) => (
              <div key={machine.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{machine.id}</div>
                  <div className="text-sm text-muted-foreground">{machine.type}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <span className={machine.status === "Running" ? "text-green-500" : "text-orange-500"}>
                      {machine.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Uptime: {machine.uptime} • Miles: {machine.computeMiles}/hr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, Users, ShoppingBag } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Spot price data (realistic SF Compute-style pricing)
const spotPriceData = [
  { time: "00:00", price: 2.89 },
  { time: "04:00", price: 2.76 },
  { time: "08:00", price: 2.92 },
  { time: "12:00", price: 3.15 },
  { time: "16:00", price: 3.08 },
  { time: "20:00", price: 2.95 },
  { time: "Now", price: 2.87 },
];

// Compute Mile/H performance data (similar to vast.ai DLPerf)
const computeMileData = [
  { time: "00:00", performance: 145 },
  { time: "04:00", performance: 142 },
  { time: "08:00", performance: 148 },
  { time: "12:00", performance: 152 },
  { time: "16:00", performance: 150 },
  { time: "20:00", performance: 147 },
  { time: "Now", performance: 149 },
];

// Mini chart data for stats
const hoursData = [
  { value: 11200 }, { value: 11800 }, { value: 12100 }, { value: 11900 }, 
  { value: 12300 }, { value: 12600 }, { value: 12458 }
];

const suppliersData = [
  { value: 138 }, { value: 141 }, { value: 139 }, { value: 143 }, 
  { value: 145 }, { value: 146 }, { value: 147 }
];

const stats = [
  {
    title: "Hours Available",
    value: "12,458",
    change: "+12.5%",
    trend: "up",
    icon: Activity,
    data: hoursData,
  },
  {
    title: "Active Suppliers",
    value: "147",
    change: "+8.1%",
    trend: "up",
    icon: Users,
    data: suppliersData,
  },
];

const recentActivity = [
  { type: "BUY", gpu: "NVIDIA A100", hours: 100, computeMiles: 148, time: "2m ago" },
  { type: "SELL", gpu: "NVIDIA A100", hours: 50, computeMiles: 152, time: "5m ago" },
  { type: "BUY", gpu: "AMD MI250", hours: 200, computeMiles: 138, time: "8m ago" },
  { type: "BUY", gpu: "NVIDIA A100", hours: 75, computeMiles: 149, time: "12m ago" },
  { type: "SELL", gpu: "AMD MI250", hours: 150, computeMiles: 141, time: "15m ago" },
];

export const MarketOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Market Overview</h2>
          <p className="text-sm text-muted-foreground">Class B Compute - Real-time trading data</p>
        </div>
        <Button size="lg" className="gap-2">
          <ShoppingBag className="h-5 w-5" />
          Buy Now at Spot
        </Button>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Spot Price</CardTitle>
            <div className="text-3xl font-bold font-mono text-foreground mt-2">
              $2.87 <span className="text-sm text-muted-foreground">/ Compute Mile</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={spotPriceData}>
                <defs>
                  <linearGradient id="spotGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  domain={[2.5, 3.3]}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#spotGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Compute Mile / H Performance</CardTitle>
            <div className="text-3xl font-bold font-mono text-foreground mt-2">
              149 <span className="text-sm text-muted-foreground">CM/H</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={computeMileData}>
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  domain={[135, 155]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => [`${value} CM/H`, 'Performance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats with mini charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
              <p className="text-xs font-medium text-success mb-3">
                {stat.change} from last period
              </p>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={stat.data}>
                  <defs>
                    <linearGradient id={`gradient-${stat.title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={1.5}
                    fill={`url(#gradient-${stat.title})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded px-2 py-1 text-xs font-bold font-mono ${
                      activity.type === "BUY"
                        ? "bg-success/20 text-success"
                        : "bg-danger/20 text-danger"
                    }`}
                  >
                    {activity.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.gpu}</p>
                    <p className="text-xs text-muted-foreground">{activity.hours} hours</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium text-foreground">
                    {activity.computeMiles} CM/H
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

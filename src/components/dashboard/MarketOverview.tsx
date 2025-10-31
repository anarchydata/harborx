import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

const stats = [
  {
    title: "Total GPU Hours Available",
    value: "12,458",
    change: "+12.5%",
    trend: "up",
    icon: Activity,
  },
  {
    title: "Average Price ($/hr)",
    value: "$2.45",
    change: "-3.2%",
    trend: "down",
    icon: DollarSign,
  },
  {
    title: "Active Suppliers",
    value: "147",
    change: "+8.1%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Total Volume (24h)",
    value: "$45,234",
    change: "+15.3%",
    trend: "up",
    icon: TrendingUp,
  },
];

const recentActivity = [
  { type: "BUY", gpu: "NVIDIA A100", hours: 100, price: 2.5, time: "2m ago" },
  { type: "SELL", gpu: "NVIDIA H100", hours: 50, price: 3.2, time: "5m ago" },
  { type: "BUY", gpu: "AMD MI250", hours: 200, price: 1.8, time: "8m ago" },
  { type: "BUY", gpu: "NVIDIA A100", hours: 75, price: 2.48, time: "12m ago" },
  { type: "SELL", gpu: "NVIDIA H100", hours: 150, price: 3.25, time: "15m ago" },
];

export const MarketOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Market Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time GPU hours trading data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className={`text-xs font-medium ${stat.trend === "up" ? "text-success" : "text-danger"}`}>
                {stat.change} from last period
              </p>
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
                    ${activity.price}/hr
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

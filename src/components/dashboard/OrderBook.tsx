import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const orders = [
  {
    id: "ORD-001",
    supplier: "CloudCompute Inc",
    gpu: "NVIDIA A100",
    hours: 500,
    price: 2.45,
    status: "available",
    location: "US-East",
  },
  {
    id: "ORD-002",
    supplier: "AI Systems Ltd",
    gpu: "NVIDIA H100",
    hours: 250,
    price: 3.20,
    status: "available",
    location: "EU-West",
  },
  {
    id: "ORD-003",
    supplier: "GPU Farm Co",
    gpu: "AMD MI250",
    hours: 1000,
    price: 1.85,
    status: "available",
    location: "US-West",
  },
  {
    id: "ORD-004",
    supplier: "DataCenter Pro",
    gpu: "NVIDIA A100",
    hours: 750,
    price: 2.50,
    status: "reserved",
    location: "Asia-Pacific",
  },
  {
    id: "ORD-005",
    supplier: "Cloud Dynamics",
    gpu: "NVIDIA H100",
    hours: 300,
    price: 3.15,
    status: "available",
    location: "US-Central",
  },
];

export const OrderBook = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Book</h2>
        <p className="text-sm text-muted-foreground">Available GPU hours for trading</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Active Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Supplier</TableHead>
                <TableHead className="text-muted-foreground">GPU Type</TableHead>
                <TableHead className="text-muted-foreground">Hours</TableHead>
                <TableHead className="text-muted-foreground">Price ($/hr)</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-foreground">{order.id}</TableCell>
                  <TableCell className="text-foreground">{order.supplier}</TableCell>
                  <TableCell className="font-medium text-foreground">{order.gpu}</TableCell>
                  <TableCell className="font-mono text-foreground">{order.hours}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">
                    ${order.price}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={order.status === "available" ? "default" : "secondary"}
                      className={
                        order.status === "available"
                          ? "bg-success/20 text-success hover:bg-success/30"
                          : ""
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

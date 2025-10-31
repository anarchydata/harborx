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
  {
    id: "ORD-006",
    supplier: "TechGrid Solutions",
    gpu: "NVIDIA A100",
    hours: 650,
    price: 2.38,
    status: "available",
    location: "EU-Central",
  },
  {
    id: "ORD-007",
    supplier: "Neural Networks Inc",
    gpu: "NVIDIA H100",
    hours: 400,
    price: 3.25,
    status: "available",
    location: "US-East",
  },
  {
    id: "ORD-008",
    supplier: "Quantum Compute",
    gpu: "AMD MI300X",
    hours: 800,
    price: 2.10,
    status: "available",
    location: "US-West",
  },
  {
    id: "ORD-009",
    supplier: "Edge Computing Co",
    gpu: "NVIDIA A100",
    hours: 200,
    price: 2.55,
    status: "reserved",
    location: "Asia-Southeast",
  },
  {
    id: "ORD-010",
    supplier: "HPC Services Ltd",
    gpu: "NVIDIA H100",
    hours: 550,
    price: 3.10,
    status: "available",
    location: "EU-North",
  },
  {
    id: "ORD-011",
    supplier: "AI Infrastructure",
    gpu: "AMD MI250",
    hours: 1200,
    price: 1.75,
    status: "available",
    location: "US-Central",
  },
  {
    id: "ORD-012",
    supplier: "MegaCloud Systems",
    gpu: "NVIDIA A100",
    hours: 900,
    price: 2.42,
    status: "available",
    location: "EU-West",
  },
  {
    id: "ORD-013",
    supplier: "DeepTech Partners",
    gpu: "NVIDIA H100",
    hours: 175,
    price: 3.30,
    status: "reserved",
    location: "US-East",
  },
  {
    id: "ORD-014",
    supplier: "Precision Computing",
    gpu: "AMD MI300X",
    hours: 600,
    price: 2.05,
    status: "available",
    location: "Asia-Pacific",
  },
  {
    id: "ORD-015",
    supplier: "ScaleUp GPU Farm",
    gpu: "NVIDIA A100",
    hours: 350,
    price: 2.48,
    status: "available",
    location: "US-West",
  },
  {
    id: "ORD-016",
    supplier: "Vertex Compute",
    gpu: "NVIDIA H100",
    hours: 425,
    price: 3.18,
    status: "available",
    location: "EU-Central",
  },
  {
    id: "ORD-017",
    supplier: "DataFlow Systems",
    gpu: "AMD MI250",
    hours: 950,
    price: 1.80,
    status: "available",
    location: "US-East",
  },
  {
    id: "ORD-018",
    supplier: "Neural Cloud",
    gpu: "NVIDIA A100",
    hours: 475,
    price: 2.52,
    status: "reserved",
    location: "Asia-Southeast",
  },
  {
    id: "ORD-019",
    supplier: "Infinity Computing",
    gpu: "NVIDIA H100",
    hours: 325,
    price: 3.22,
    status: "available",
    location: "US-Central",
  },
  {
    id: "ORD-020",
    supplier: "SuperCompute Labs",
    gpu: "AMD MI300X",
    hours: 700,
    price: 2.15,
    status: "available",
    location: "EU-West",
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

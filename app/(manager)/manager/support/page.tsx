import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Support Center | Manager Dashboard",
};

const tickets = [
  { id: "TCK-901", subject: "Order hasn't arrived yet", customer: "Liam Johnson", type: "Delivery", priority: "High", status: "Open" },
  { id: "TCK-902", subject: "Wrong size received", customer: "Olivia Smith", type: "Return/Exchange", priority: "Medium", status: "In Progress" },
  { id: "TCK-903", subject: "Refund request for ORD-5316", customer: "William Garcia", type: "Refund", priority: "High", status: "Open" },
  { id: "TCK-904", subject: "Question about fabric material", customer: "Emma Brown", type: "Product Inquiry", priority: "Low", status: "Closed" },
  { id: "TCK-905", subject: "Promo code not working", customer: "Noah Williams", type: "Billing", priority: "Medium", status: "In Progress" },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer inquiries, returns, and refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <MessageCircle className="mr-2 h-4 w-4" />
            Live Chat (3 Active)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1h 15m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSAT Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">4.8/5</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tickets..."
            className="w-full bg-background pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium text-muted-foreground">{ticket.id}</TableCell>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>{ticket.customer}</TableCell>
                <TableCell>{ticket.type}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      ticket.priority === "High" ? "destructive" :
                      ticket.priority === "Medium" ? "secondary" : "outline"
                    }
                    className={ticket.priority === "Medium" ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      ticket.status === "Open" ? "default" :
                      ticket.status === "In Progress" ? "secondary" : "outline"
                    }
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Reply
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Heart,
  Clock,
  MessageSquare,
  Mail,
  Trophy,
  MoreVertical,
  Activity,
} from "lucide-react";
import { fetchCustomerDetailsAction } from "@/app/actions/crm/customer.actions";
import { CustomerActionButtons } from "./CustomerActionButtons";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const customerId = (await params).id;
  const { success, data, error } = await fetchCustomerDetailsAction(customerId);

  if (!success || !data) {
    return (
      <div className="p-8 text-red-500">
        Error loading customer details: {error}
      </div>
    );
  }

  const { profile, ticketsCount, tier, points, ltv, segments } = data;
  const customer = {
    name: profile.first_name
      ? `${profile.first_name} ${profile.last_name || ""}`
      : "Unknown Customer",
    email: profile.email,
    phone: profile.phone || "No phone",
    avatar:
      profile.avatar_url ||
      `https://ui-avatars.com/api/?name=${profile.first_name || "User"}`,
    tier,
    points,
    ltv,
    joinDate: new Date(profile.created_at).toLocaleDateString(),
    segments,
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Section */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-6 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
            <AvatarImage src={customer.avatar} />
            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">{customer.email}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{customer.phone}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant="secondary">{customer.tier} Tier</Badge>
              {customer.segments.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <CustomerActionButtons customerId={customerId} initialPoints={customer.points} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Value
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.ltv}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.points.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Support Tickets
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Check support history for details
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="border bg-background">
          <TabsTrigger value="activity">Timeline & Activity</TabsTrigger>
          <TabsTrigger value="orders">Purchase History</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist & Browsing</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="support">Support History</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Timeline</CardTitle>
              <CardDescription>
                Comprehensive view of all customer interactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent md:before:mx-auto md:before:translate-x-0">
                <div className="is-active group relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] rounded-lg border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                    <div className="mb-1 flex items-center justify-between space-x-2">
                      <div className="font-bold">Placed Order #ORD-8832</div>
                      <time className="text-xs text-muted-foreground">
                        2 hours ago
                      </time>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Purchased 3 items for $450.00. Points earned: 1,350.
                    </div>
                  </div>
                </div>

                <div className="is-active group relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-background bg-secondary text-secondary-foreground shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] rounded-lg border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                    <div className="mb-1 flex items-center justify-between space-x-2">
                      <div className="font-bold">Live Chat Session</div>
                      <time className="text-xs text-muted-foreground">
                        Yesterday
                      </time>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Inquired about sizing for the Summer Collection. Resolved
                      by Agent Sarah.
                    </div>
                  </div>
                </div>

                <div className="is-active group relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-background bg-accent text-accent-foreground shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] rounded-lg border bg-card p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                    <div className="mb-1 flex items-center justify-between space-x-2">
                      <div className="font-bold">Added to Wishlist</div>
                      <time className="text-xs text-muted-foreground">
                        3 days ago
                      </time>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Added "Silk Evening Gown" to wishlist.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Order history table placeholder.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist & Browsing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Wishlist items and recent views placeholder.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Email and SMS history placeholder.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Past tickets and chats placeholder.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

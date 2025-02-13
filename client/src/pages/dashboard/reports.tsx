import { Sidebar } from "@/components/dashboard/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Order, MenuItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu/items"],
  });

  if (ordersLoading || itemsLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  // Calculate daily revenue for the last 7 days
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = orders?.filter(
      order => order.createdAt.startsWith(dateStr)
    ) || [];
    
    return {
      date: dateStr,
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0) / 100,
    };
  }).reverse();

  // Calculate popular items
  const itemCounts = new Map<number, number>();
  orders?.forEach(order => {
    order.items.forEach(item => {
      const count = itemCounts.get(item.menuItemId) || 0;
      itemCounts.set(item.menuItemId, count + item.quantity);
    });
  });

  const popularItems = Array.from(itemCounts.entries())
    .map(([itemId, count]) => ({
      name: menuItems?.find(item => item.id === itemId)?.name || `Item #${itemId}`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>

          {/* Revenue Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

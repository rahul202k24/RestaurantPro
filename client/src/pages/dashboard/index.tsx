import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Order, MenuItem } from "@shared/schema";
import {
  BarChart,
  DollarSign,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"] 
  });

  const { data: menuItems } = useQuery<MenuItem[]>({ 
    queryKey: ["/api/menu/items"] 
  });

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders?.filter(
    order => order.createdAt.startsWith(today)
  ) || [];

  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const stats = [
    {
      name: "Today's Revenue",
      value: `$${(totalRevenue / 100).toFixed(2)}`,
      icon: DollarSign,
      description: "Total revenue for today",
    },
    {
      name: "Orders Today",
      value: totalOrders,
      icon: ShoppingBag,
      description: "Number of orders today",
    },
    {
      name: "Average Order Value",
      value: `$${(avgOrderValue / 100).toFixed(2)}`,
      icon: TrendingUp,
      description: "Average order value today",
    },
    {
      name: "Menu Items",
      value: menuItems?.length || 0,
      icon: BarChart,
      description: "Total active menu items",
    },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Orders Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="bg-card rounded-lg shadow">
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Table</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="py-3">#{order.id}</td>
                        <td className="py-3">Table {order.tableNumber}</td>
                        <td className="py-3">${(order.total / 100).toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

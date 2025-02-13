import { Sidebar } from "@/components/dashboard/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  const pendingOrders = orders?.filter((order) => order.status === "pending") || [];
  const completedOrders = orders?.filter((order) => order.status === "completed") || [];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Orders</h1>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Pending Orders */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Orders</h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Table {order.tableNumber}
                        </CardTitle>
                        <Badge variant="secondary">#{order.id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm py-1"
                            >
                              <span>
                                {item.quantity}x Item #{item.menuItemId}
                              </span>
                              {item.modifiers?.map((mod, i) => (
                                <span key={i} className="text-muted-foreground">
                                  {mod.name}: {mod.option}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-semibold">
                            Total: ${(order.total / 100).toFixed(2)}
                          </span>
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: "completed",
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: "cancelled",
                                })
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed Orders */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Table {order.tableNumber}
                        </CardTitle>
                        <Badge variant="secondary">#{order.id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm py-1"
                            >
                              <span>
                                {item.quantity}x Item #{item.menuItemId}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-semibold">
                            Total: ${(order.total / 100).toFixed(2)}
                          </span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
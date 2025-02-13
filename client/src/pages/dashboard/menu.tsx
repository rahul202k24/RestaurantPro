import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MenuCategory, MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, PencilIcon, Loader2 } from "lucide-react";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MenuPage() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/menu/categories"],
  });

  const { data: items, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu/items"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<MenuItem, "id">) => {
      const res = await apiRequest("POST", "/api/menu/items", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
      setIsDialogOpen(false);
    },
  });

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedItem ? "Edit Menu Item" : "Add Menu Item"}
                  </DialogTitle>
                </DialogHeader>
                <MenuItemForm
                  categories={categories || []}
                  initialData={selectedItem}
                  onSubmit={(data) => {
                    createMutation.mutate(data);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue={categories?.[0]?.id.toString()}>
            <TabsList className="mb-8">
              {categories?.map((category) => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories?.map((category) => (
              <TabsContent key={category.id} value={category.id.toString()}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items
                    ?.filter((item) => item.categoryId === category.id)
                    .map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                ${(item.price / 100).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDialogOpen(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { QrCodeGenerator } from "@/components/qr/qr-code-generator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { QrCode } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function QrCodesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: qrCodes, isLoading } = useQuery<QrCode[]>({
    queryKey: ["/api/qr-codes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<QrCode, "id">) => {
      const res = await apiRequest("POST", "/api/qr-codes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
      setIsDialogOpen(false);
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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">QR Codes</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate QR Code</DialogTitle>
                </DialogHeader>
                <QrCodeGenerator onSubmit={(data) => createMutation.mutate(data)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {qrCodes?.map((qrCode) => (
              <Card key={qrCode.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Table {qrCode.tableNumber}</h3>
                  <div className="aspect-square bg-white p-4 rounded-lg shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${window.location.origin}/menu?table=${qrCode.tableNumber}`
                      )}`}
                      alt={`QR Code for table ${qrCode.tableNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

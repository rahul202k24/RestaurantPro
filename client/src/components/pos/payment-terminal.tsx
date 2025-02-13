import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Banknote, Wallet } from "lucide-react";

const paymentMethods = [
  { id: "credit", label: "Credit Card", icon: CreditCard },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "wallet", label: "Digital Wallet", icon: Wallet },
];

interface PaymentTerminalProps {
  order: {
    id: number;
    total: number;
    paymentStatus: string;
  };
  onPaymentComplete: () => void;
}

export function PaymentTerminal({ order, onPaymentComplete }: PaymentTerminalProps) {
  const [isPaying, setIsPaying] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      orderId: order.id,
      amount: order.total,
      paymentMethod: "",
      status: "pending",
    },
  });

  const handlePayment = async (data: any) => {
    setIsPaying(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      onPaymentComplete();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsPaying(false);
    }
  };

  if (order.paymentStatus === "paid") {
    return (
      <div className="p-6 text-center">
        <div className="text-green-500 mb-2">
          <CheckCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Complete</h3>
        <p className="text-muted-foreground">
          Order #{order.id} has been paid
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold">
            Total: ${(order.total / 100).toFixed(2)}
          </h3>
        </div>

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPaying}>
          {isPaying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Process Payment"
          )}
        </Button>
      </form>
    </Form>
  );
}

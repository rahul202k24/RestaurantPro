import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQrCodeSchema, QrCode } from "@shared/schema";
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
import { z } from "zod";

interface QrCodeGeneratorProps {
  onSubmit: (data: Omit<QrCode, "id">) => void;
}

const formSchema = insertQrCodeSchema.extend({
  customization: z.object({
    color: z.string().optional(),
    logo: z.string().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

export function QrCodeGenerator({ onSubmit }: QrCodeGeneratorProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tableNumber: undefined,
      customization: {
        color: "#000000",
        logo: "",
        pattern: "",
      },
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tableNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customization.color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QR Code Color</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...field} type="color" className="w-12 h-10 p-1" />
                  <Input {...field} className="flex-1" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customization.logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL (optional)</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Generate QR Code
        </Button>
      </form>
    </Form>
  );
}

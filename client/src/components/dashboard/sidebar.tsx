import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Menu,
  QrCode,
  ShoppingCart,
  BarChart2,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Menu", href: "/menu", icon: Menu },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Reports", href: "/reports", icon: BarChart2 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-sidebar-foreground">
          Restaurant Manager
        </h1>
        <p className="text-sm text-sidebar-foreground/60">
          Welcome, {user?.username}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

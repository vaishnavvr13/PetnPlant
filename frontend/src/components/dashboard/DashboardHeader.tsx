import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Leaf, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export const DashboardHeader = () => {
  const { profile, role, signOut } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display text-xl font-bold">
            PetPlant<span className="text-primary">Care</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-muted-foreground hidden sm:block">
            {getGreeting()}, <span className="text-foreground font-medium">{profile?.full_name?.split(" ")[0] || "there"}</span>
          </span>
          
          {role === "admin" && (
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
          
          <NotificationBell />
          
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

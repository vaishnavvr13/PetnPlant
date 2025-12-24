import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";

const Dashboard = () => {
  const { profile, role } = useAuth();

  const isProvider = profile?.user_type === "provider" || role === "provider";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        {isProvider ? <ProviderDashboard /> : <OwnerDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;

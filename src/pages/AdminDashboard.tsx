import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KYCManagement } from "@/components/admin/KYCManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { Shield, Users, FileCheck } from "lucide-react";

const AdminDashboard = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and KYC documents</p>
          </div>
        </div>

        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              KYC Documents
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kyc">
            <KYCManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

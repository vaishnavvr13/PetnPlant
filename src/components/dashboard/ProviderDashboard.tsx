import { useAuth } from "@/hooks/useAuth";
import { ProfileCard } from "./ProfileCard";
import { KYCUpload } from "@/components/provider/KYCUpload";
import { ServiceManager } from "@/components/provider/ServiceManager";
import { BookingRequests } from "@/components/provider/BookingRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, DollarSign, Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const ProviderDashboard = () => {
  const { profile } = useAuth();

  const providerStats = [
    {
      icon: Calendar,
      label: "Pending Requests",
      value: "0",
      description: "Awaiting your response",
    },
    {
      icon: CheckCircle,
      label: "Completed Jobs",
      value: "0",
      description: "Total completed",
    },
    {
      icon: Star,
      label: "Average Rating",
      value: "—",
      description: "No reviews yet",
    },
    {
      icon: DollarSign,
      label: "This Month",
      value: "$0",
      description: "Earnings",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <Badge variant="outline" className="border-primary/50 text-primary">
            Care Provider
          </Badge>
        </div>
        <h1 className="text-3xl font-display font-bold">
          Provider Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your services, bookings, and client relationships
        </p>
      </motion.div>

      {/* KYC Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <KYCUpload />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {providerStats.map((stat) => (
          <Card key={stat.label} className="card-elevated hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <ProfileCard />
        </motion.div>

        {/* Services and Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <ServiceManager />
          <BookingRequests />
        </motion.div>
      </div>
    </div>
  );
};

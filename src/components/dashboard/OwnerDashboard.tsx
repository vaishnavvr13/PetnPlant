import { useAuth } from "@/hooks/useAuth";
import { ProfileCard } from "./ProfileCard";
import { MyBookings } from "@/components/owner/MyBookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, Leaf, Calendar, Heart, Clock, Star, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const OwnerDashboard = () => {
  const { profile } = useAuth();

  const isPetOwner = profile?.user_type === "pet_owner" || profile?.user_type === "both";
  const isPlantOwner = profile?.user_type === "plant_owner" || profile?.user_type === "both";

  const quickStats = [
    {
      icon: Calendar,
      label: "Upcoming Bookings",
      value: "0",
      description: "No bookings yet",
    },
    {
      icon: Heart,
      label: "Favorite Providers",
      value: "0",
      description: "Save your favorites",
    },
    {
      icon: Clock,
      label: "Total Sessions",
      value: "0",
      description: "Start booking!",
    },
    {
      icon: Star,
      label: "Reviews Given",
      value: "0",
      description: "Rate your experiences",
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
          {isPetOwner && <PawPrint className="h-8 w-8 text-primary" />}
          {isPlantOwner && <Leaf className="h-8 w-8 text-primary" />}
        </div>
        <h1 className="text-3xl font-display font-bold">
          Welcome to your Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          {isPetOwner && isPlantOwner
            ? "Manage your pets and plants care all in one place"
            : isPetOwner
            ? "Manage your pet care bookings and preferences"
            : "Manage your plant care bookings and preferences"}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, index) => (
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

        {/* Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* My Bookings */}
          <MyBookings />

          {/* Browse Services CTA */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Find Care Providers</CardTitle>
              <CardDescription>Browse available services for your {isPetOwner && isPlantOwner ? "pets and plants" : isPetOwner ? "pets" : "plants"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-6 text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Find trusted care providers in your area
                </p>
                <Link to="/services">
                  <Button className="bg-primary text-primary-foreground">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Services
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

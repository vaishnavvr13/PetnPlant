import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedProvider {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  avgRating: number;
  reviewCount: number;
  serviceCount: number;
  categories: string[];
}

const categoryLabels: Record<string, string> = {
  pet_sitting: "Pet Sitting",
  dog_walking: "Dog Walking",
  pet_grooming: "Pet Grooming",
  pet_training: "Pet Training",
  plant_care: "Plant Care",
  garden_maintenance: "Garden Maintenance",
};

export default function FeaturedProviders() {
  const [providers, setProviders] = useState<FeaturedProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProviders();
  }, []);

  const fetchFeaturedProviders = async () => {
    try {
      // Fetch all reviews to calculate average ratings per provider
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("provider_id, rating");

      if (reviewsError) throw reviewsError;

      // Calculate average rating per provider
      const providerRatings = new Map<string, { sum: number; count: number }>();
      reviews?.forEach((review) => {
        const existing = providerRatings.get(review.provider_id) || { sum: 0, count: 0 };
        providerRatings.set(review.provider_id, {
          sum: existing.sum + review.rating,
          count: existing.count + 1,
        });
      });

      // Get top providers by average rating (minimum 1 review)
      const topProviderIds = Array.from(providerRatings.entries())
        .map(([id, { sum, count }]) => ({
          id,
          avgRating: Math.round((sum / count) * 10) / 10,
          reviewCount: count,
        }))
        .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
        .slice(0, 4);

      if (topProviderIds.length === 0) {
        setProviders([]);
        setLoading(false);
        return;
      }

      // Fetch provider profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", topProviderIds.map((p) => p.id));

      if (profilesError) throw profilesError;

      // Fetch services for these providers
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("provider_id, category")
        .in("provider_id", topProviderIds.map((p) => p.id))
        .eq("is_active", true);

      if (servicesError) throw servicesError;

      // Build provider data
      const featuredProviders: FeaturedProvider[] = topProviderIds.map((provider) => {
        const profile = profiles?.find((p) => p.user_id === provider.id);
        const providerServices = services?.filter((s) => s.provider_id === provider.id) || [];
        const categories = [...new Set(providerServices.map((s) => s.category))];

        return {
          user_id: provider.id,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          avgRating: provider.avgRating,
          reviewCount: provider.reviewCount,
          serviceCount: providerServices.length,
          categories,
        };
      });

      setProviders(featuredProviders);
    } catch (error) {
      console.error("Error fetching featured providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="animate-pulse h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Top-Rated Providers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet our highest-rated service providers trusted by pet and plant owners
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.user_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/provider/${provider.user_id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="pt-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src={provider.avatar_url || undefined} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {provider.full_name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg mb-2">
                      {provider.full_name || "Service Provider"}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {renderStars(provider.avgRating)}
                      <span className="font-medium">{provider.avgRating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"} · {provider.serviceCount} {provider.serviceCount === 1 ? "service" : "services"}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {provider.categories.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {categoryLabels[cat] || cat}
                        </Badge>
                      ))}
                      {provider.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button asChild variant="outline" size="lg">
            <Link to="/services">
              Browse All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

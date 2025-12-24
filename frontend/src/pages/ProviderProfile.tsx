import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, ArrowLeft, User } from "lucide-react";
import { ProviderRating } from "@/components/reviews/ProviderRating";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price_per_hour: number;
  location: string | null;
  is_active: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer_name?: string;
}

const categoryLabels: Record<string, string> = {
  pet_sitting: "Pet Sitting",
  dog_walking: "Dog Walking",
  pet_grooming: "Pet Grooming",
  pet_training: "Pet Training",
  plant_care: "Plant Care",
  garden_maintenance: "Garden Maintenance",
};

export default function ProviderProfile() {
  const { providerId } = useParams<{ providerId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (providerId) {
      fetchProviderData();
    }
  }, [providerId]);

  const fetchProviderData = async () => {
    try {
      // Fetch provider profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", providerId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch provider services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", providerId)
        .eq("is_active", true);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch reviews for this provider
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch reviewer names
      if (reviewsData && reviewsData.length > 0) {
        const reviewerIds = [...new Set(reviewsData.map((r) => r.reviewer_id))];
        const { data: reviewerProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", reviewerIds);

        const reviewerMap = new Map(
          reviewerProfiles?.map((p) => [p.user_id, p.full_name]) || []
        );

        const reviewsWithNames = reviewsData.map((review) => ({
          ...review,
          reviewer_name: reviewerMap.get(review.reviewer_id) || "Anonymous",
        }));

        setReviews(reviewsWithNames);
      }
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Provider not found</p>
        <Button asChild variant="outline">
          <Link to="/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </Button>
      </div>
    );
  }

  const avgRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </Button>

        {/* Provider Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">
                  {profile.full_name || "Service Provider"}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <ProviderRating providerId={providerId!} />
                </div>
                <p className="text-muted-foreground mt-2">
                  {services.length} active {services.length === 1 ? "service" : "services"}
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold text-primary">{avgRating}</div>
                <div className="flex justify-center md:justify-end mt-1">
                  {renderStars(Math.round(avgRating))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
          {services.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active services available
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <Badge variant="secondary">
                        {categoryLabels[service.category] || service.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.description && (
                      <p className="text-muted-foreground text-sm mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {service.location && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {service.location}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-primary">
                        ${service.price_per_hour}/hr
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No reviews yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{review.reviewer_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(review.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

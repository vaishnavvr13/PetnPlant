import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface ProviderRatingProps {
  providerId: string;
  showCount?: boolean;
}

export const ProviderRating = ({ providerId, showCount = true }: ProviderRatingProps) => {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchRating();
  }, [providerId]);

  const fetchRating = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("provider_id", providerId);

    if (error) {
      console.error("Error fetching rating:", error);
      return;
    }

    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAvgRating(Math.round(avg * 10) / 10);
      setReviewCount(data.length);
    }
  };

  if (avgRating === null) {
    return (
      <span className="text-sm text-muted-foreground">No reviews yet</span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 fill-primary text-primary" />
      <span className="font-medium">{avgRating}</span>
      {showCount && (
        <span className="text-muted-foreground text-sm">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
};

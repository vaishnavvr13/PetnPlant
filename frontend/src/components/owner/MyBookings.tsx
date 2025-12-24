import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, DollarSign, User, XCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { ReviewForm } from "@/components/reviews/ReviewForm";

type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

interface Booking {
  _id: string;
  service: { _id: string; title: string; category: string };
  provider: { _id: string; fullName: string; email: string };
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  hasReview?: boolean;
}

export const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.put(`/bookings/${bookingId}`, { status: 'cancelled' });

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled",
      });

      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Pending</Badge>;
    }
  };

  const upcomingBookings = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status) && new Date(b.scheduledDate) >= new Date()
  );
  const pastBookings = bookings.filter(b =>
    !['pending', 'confirmed'].includes(b.status) || new Date(b.scheduledDate) < new Date()
  );

  return (
    <>
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            My Bookings
          </CardTitle>
          <CardDescription>Track your service requests and appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted mb-4 mx-auto w-fit">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No bookings yet</p>
              <p className="text-sm text-muted-foreground mt-1">Browse services to make your first booking</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Upcoming ({upcomingBookings.length})
                  </h3>
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-lg border border-primary/30 bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{booking.service?.title}</p>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <User className="h-4 w-4" />
                              <span>{booking.provider?.fullName || booking.provider?.email}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {booking.scheduledTime} ({booking.durationHours}h)
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${booking.totalPrice}
                              </span>
                            </div>
                          </div>
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelBooking(booking._id)}
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastBookings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Past Bookings ({pastBookings.length})</h3>
                  <div className="space-y-3">
                    {pastBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{booking.service?.title}</p>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${booking.totalPrice}
                              </span>
                            </div>
                          </div>
                          {booking.status === 'completed' && !booking.hasReview && (
                            <Button
                              size="sm"
                              onClick={() => setReviewBooking(booking)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                          {booking.hasReview && (
                            <Badge variant="outline" className="text-primary border-primary/30">
                              <Star className="h-3 w-3 mr-1 fill-primary" />
                              Reviewed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {reviewBooking && (
        <ReviewForm
          bookingId={reviewBooking._id}
          providerId={reviewBooking.provider._id}
          open={!!reviewBooking}
          onOpenChange={(open) => !open && setReviewBooking(null)}
          onSuccess={fetchBookings}
        />
      )}
    </>
  );
};

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, Clock, DollarSign, Check, X, MessageSquare } from "lucide-react";
import { format } from "date-fns";

type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

interface Booking {
  _id: string;
  service: { _id: string; title: string; category: string };
  owner: { _id: string; fullName: string; email: string };
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
}

export const BookingRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings', {
        params: { asProvider: true }
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status });

      toast({
        title: status === 'confirmed' ? "Booking confirmed" : "Booking declined",
        description: status === 'confirmed'
          ? "The client has been notified"
          : "The client has been notified of your decision",
      });

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
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

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const otherBookings = bookings.filter(b => b.status !== 'pending');

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Booking Requests
        </CardTitle>
        <CardDescription>Manage incoming booking requests from clients</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4 mx-auto w-fit">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No booking requests yet</p>
            <p className="text-sm text-muted-foreground mt-1">New requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingBookings.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  Pending Requests ({pendingBookings.length})
                </h3>
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{booking.service?.title}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Client: {booking.owner?.fullName || booking.owner?.email}
                          </p>
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
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking._id, 'rejected')}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Bookings */}
            {otherBookings.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Past & Upcoming ({otherBookings.length})</h3>
                <div className="space-y-3">
                  {otherBookings.map((booking) => (
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
                          <p className="text-sm text-muted-foreground mt-1">
                            Client: {booking.owner?.fullName || booking.owner?.email}
                          </p>
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
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                          >
                            Mark Complete
                          </Button>
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
  );
};

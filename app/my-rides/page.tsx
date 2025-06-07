"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Users, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCollege } from "@/contexts/college-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Types
type Ride = {
  id: string
  from_location: string
  to_location: string
  departure_time: string
  seats_available: number
  price_per_seat: number
  description?: string
  status: string
  is_intercampus: boolean
}

type Booking = {
  id: string
  ride_id: string
  seats_booked: number
  status: string
  payment_status: string
  ride: Ride
  // Additional properties that might be present when created from Find Rides page
  from?: string
  to?: string
  date?: string
  time?: string
  price?: number
  departure_time?: string
  isIntercampus?: boolean
  driver?: {
    name: string
    rating: number
    college: string
  }
}

export default function MyRidesPage() {
  const { selectedCollege } = useCollege()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [driverRides, setDriverRides] = useState<Ride[]>([])
  const [passengerBookings, setPassengerBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRideId, setCurrentRideId] = useState<string | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null)
  const [localBusinesses, setLocalBusinesses] = useState([
    { id: "1", name: "Spartans" },
    { id: "2", name: "In-N-Out" }
  ]);

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?callbackUrl=/my-rides')
      return
    }
    
    // If user is authenticated, fetch rides
    if (user) {
      fetchMyRides()
    }
  }, [user, authLoading, router])

  // Load rides from both localStorage and demo data
  const fetchMyRides = async () => {
    setLoading(true);
    try {
      if (!user) {
        console.log("User not authenticated, cannot fetch rides");
        return;
      }

      console.log("🔍 Fetching rides for user:", user.id);

      // Fetch rides where the current user is the driver
      const { data: driverRidesData, error: driverError } = await supabase
        .from('rides')
        .select(`
          *,
          driver:users!fk_driver(*)
        `)
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: true });

      if (driverError) {
        console.error("❌ Error fetching driver rides:", driverError);
        throw new Error(`Failed to fetch your rides: ${driverError.message}`);
      }

      console.log("✅ Driver rides fetched:", driverRidesData);

      // Transform database rides to match UI format
      const transformedDriverRides = (driverRidesData || []).map(ride => ({
        id: ride.id,
        from_location: ride.origin,
        to_location: ride.destination,
        departure_time: ride.departure_time,
        seats_available: ride.available_seats,
        price_per_seat: ride.price_per_seat,
        description: ride.notes,
        status: ride.status || 'active',
        is_intercampus: ride.origin.toLowerCase().includes('campus') && ride.destination.toLowerCase().includes('campus'),
      }));

      setDriverRides(transformedDriverRides);

      // Fetch rides where the current user has bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error("❌ Error fetching bookings:", bookingsError);
        // Don't throw error for bookings, just log it
        setPassengerBookings([]);
      } else {
        console.log("✅ Bookings fetched:", bookingsData);

        // Transform database bookings to match UI format
        const transformedBookings = (bookingsData || []).map(booking => ({
          id: booking.id,
          ride_id: booking.ride_id,
          seats_booked: booking.seats_booked,
          status: booking.status,
          payment_status: 'paid', // Assuming paid for now
          ride: {
            id: booking.ride_id,
            from_location: 'Loading...', // We'll fetch ride details separately
            to_location: 'Loading...',
            departure_time: new Date().toISOString(),
            seats_available: 0,
            price_per_seat: 0,
            status: 'active',
            is_intercampus: false,
          }
        }));

        setPassengerBookings(transformedBookings);
      }

      // Show demo data if no real data is found
      if (transformedDriverRides.length === 0) {
        console.log("📝 No real rides found, showing demo data");
        const exampleRides = [
          {
            id: "demo-1",
            from_location: `${selectedCollege?.abbreviation || 'Campus'} Campus`,
            to_location: "Downtown",
            departure_time: "2025-05-01T17:30:00",
            seats_available: 2,
            price_per_seat: 5,
            status: "active",
            is_intercampus: false,
            description: "Demo ride - create a real ride using the 'Offer a Ride' button above!"
          }
        ];
        setDriverRides(exampleRides);
      }

    } catch (error) {
      console.error("💥 Error in fetchMyRides:", error);
      setError(error instanceof Error ? error.message : "Failed to load rides");
      
      toast({
        title: "Error Loading Rides",
        description: "Failed to load your rides. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  // Function to cancel a ride
  const handleCancelRide = (rideId: string) => {
    setCurrentRideId(rideId);
    setIsDialogOpen(true);
  };

  // Function to confirm ride cancellation
  const confirmCancelRide = () => {
    if (!currentRideId) return;
    
    try {
      // Get existing rides from localStorage
      const storedRidesJSON = localStorage.getItem('offeredRides');
      if (!storedRidesJSON) {
        throw new Error('No rides found in localStorage');
      }
      
      const storedRides = JSON.parse(storedRidesJSON);
      
      // Find the ride to cancel
      const updatedRides = storedRides.map((ride: Ride) => {
        if (ride.id === currentRideId) {
          return { ...ride, status: 'cancelled' };
        }
        return ride;
      });
      
      // Save updated rides to localStorage
      localStorage.setItem('offeredRides', JSON.stringify(updatedRides));
      
      // Update state
      setDriverRides(updatedRides);
      
      // Show success toast
      toast({
        title: "Ride Cancelled",
        description: "Your ride has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling ride:', error);
      setError('Failed to cancel ride. Please try again.');
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to cancel ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Close dialog
      setIsDialogOpen(false);
      setCurrentRideId(null);
    }
  };

  // Function to cancel a booking
  const handleCancelBooking = (bookingId: string) => {
    setCurrentBookingId(bookingId);
    setIsBookingDialogOpen(true);
  };

  // Function to confirm booking cancellation
  const confirmCancelBooking = () => {
    if (!currentBookingId) return;
    
    try {
      // Get existing bookings from localStorage
      const storedBookingsJSON = localStorage.getItem('rideBookings');
      if (!storedBookingsJSON) {
        throw new Error('No bookings found in localStorage');
      }
      
      const storedBookings = JSON.parse(storedBookingsJSON);
      
      // Find the booking to cancel
      const updatedBookings = storedBookings.map((booking: Booking) => {
        if (booking.id === currentBookingId) {
          return { ...booking, status: 'cancelled' };
        }
        return booking;
      });
      
      // Save updated bookings to localStorage
      localStorage.setItem('rideBookings', JSON.stringify(updatedBookings));
      
      // Find the ride that was booked and update its seat availability
      const booking = storedBookings.find((b: Booking) => b.id === currentBookingId);
      if (booking) {
        // Get all rides from localStorage
        const storedRidesJSON = localStorage.getItem('offeredRides');
        if (storedRidesJSON) {
          const storedRides = JSON.parse(storedRidesJSON);
          
          // Update the available seats for the ride
          const updatedRides = storedRides.map((ride: Ride) => {
            if (ride.id === booking.ride_id) {
              return { 
                ...ride, 
                seats_available: ride.seats_available + booking.seats_booked 
              };
            }
            return ride;
          });
          
          // Save updated rides to localStorage
          localStorage.setItem('offeredRides', JSON.stringify(updatedRides));
          
          // Update driver rides if necessary
          setDriverRides(prev => prev.map(ride => {
            if (ride.id === booking.ride_id) {
              return { 
                ...ride, 
                seats_available: ride.seats_available + booking.seats_booked 
              };
            }
            return ride;
          }));
        }
      }
      
      // Update state
      setPassengerBookings(updatedBookings);
      
      // Show success toast
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Close dialog
      setIsBookingDialogOpen(false);
      setCurrentBookingId(null);
    }
  };

  // Show loading indicator if auth check is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Rides</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <Tabs defaultValue="driver">
          <TabsList className="mb-6">
            <TabsTrigger value="driver">Rides I'm Offering</TabsTrigger>
            <TabsTrigger value="passenger">Rides I've Booked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="driver">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Rides You're Offering</h2>
              
              {loading ? (
                <p>Loading your rides...</p>
              ) : driverRides.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't offered any rides yet.</p>
                  <Button variant="default" onClick={() => window.location.href = "/offer"}>
                    Offer a Ride
                  </Button>
                </div>
              ) : (
                driverRides.map((ride) => (
                  <Card key={ride.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{ride.from_location} → {ride.to_location}</h3>
                              <p className="text-gray-500">
                                {formatDate(ride.departure_time)}
                              </p>
                            </div>
                            <div>
                              <Badge variant={ride.status === "active" ? "default" : "secondary"}>
                                {ride.status === "active" ? "Active" : ride.status}
                              </Badge>
                              {ride.is_intercampus && <Badge className="ml-2 bg-blue-500">Intercampus</Badge>}
                            </div>
                          </div>
                          
                          {ride.description && (
                            <p className="text-gray-600 mb-4">{ride.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="mr-1" size={16} />
                              <span>{ride.seats_available} seats available</span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="mr-1" size={16} />
                              <span>${ride.price_per_seat} per seat</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/offer/edit/${ride.id}`)}
                              disabled={ride.status !== "active"}
                            >
                              Edit Ride
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2 text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelRide(ride.id)}
                              disabled={ride.status !== "active"}
                            >
                              Cancel Ride
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="passenger">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Rides You've Booked</h2>
              
              {loading ? (
                <p>Loading your bookings...</p>
              ) : passengerBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't booked any rides yet.</p>
                  <Button variant="default" onClick={() => window.location.href = "/find"}>
                    Find a Ride
                  </Button>
                </div>
              ) : (
                passengerBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.from || (booking.ride?.from_location || "Unknown")} → {booking.to || (booking.ride?.to_location || "Unknown")}
                              </h3>
                              <p className="text-gray-500">
                                {formatDate(booking.departure_time || booking.ride?.departure_time || new Date().toISOString())}
                              </p>
                            </div>
                            <div>
                              <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                              {(booking.ride?.is_intercampus || booking.isIntercampus) && <Badge className="ml-2 bg-blue-500">Intercampus</Badge>}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="mr-1" size={16} />
                              <span>{booking.seats_booked || 1} seat(s) booked</span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="mr-1" size={16} />
                              <span>${(booking.price || (booking.ride?.price_per_seat || 0)) * (booking.seats_booked || 1)} total</span>
                            </div>
                            <div className="flex items-center">
                              <Badge variant={booking.payment_status === "paid" ? "default" : "outline"} 
                                     className={booking.payment_status === "paid" ? "bg-green-100 text-green-800" : ""}>
                                {booking.payment_status || "paid"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/find/booking/${booking.id}`)}
                              disabled={booking.status !== "confirmed"}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2 text-red-600 hover:bg-red-50"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={booking.status !== "confirmed"}
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Confirmation Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Ride</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this ride? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Nevermind</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancelRide} className="bg-red-600 hover:bg-red-700">
                Yes, Cancel Ride
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Booking Cancellation Dialog */}
        <AlertDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Nevermind</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancelBooking} className="bg-red-600 hover:bg-red-700">
                Yes, Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
} 
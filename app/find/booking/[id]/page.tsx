"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Calendar, Clock, Users, CreditCard, ArrowLeft, Star, School, Coffee } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCollege } from "@/contexts/college-context"

type Booking = {
  id: string
  ride_id: string
  seats_booked: number
  status: string
  payment_status: string
  ride: {
    id: string
    from_location: string
    to_location: string
    departure_time: string
    seats_available: number
    price_per_seat: number
    status: string
    is_intercampus: boolean
  }
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

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { selectedCollege } = useCollege()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch booking data
    const fetchBookingData = async () => {
      setLoading(true)
      try {
        // Try to load booking from localStorage
        if (typeof window !== 'undefined') {
          const storedBookingsJSON = localStorage.getItem('rideBookings')
          if (storedBookingsJSON) {
            const storedBookings = JSON.parse(storedBookingsJSON)
            const bookingData = storedBookings.find((b: Booking) => b.id === params.id)
            
            if (bookingData) {
              setBooking(bookingData)
            } else {
              // Fallback to demo booking if not found
              setBooking({
                id: params.id as string,
                ride_id: "demo-ride-1",
                seats_booked: 1,
                status: "confirmed",
                payment_status: "paid",
                ride: {
                  id: "demo-ride-1",
                  from_location: "Stanford Campus",
                  to_location: `${selectedCollege?.abbreviation || 'Campus'} Campus`,
                  departure_time: "2025-05-02T14:00:00",
                  seats_available: 1,
                  price_per_seat: 8,
                  status: "active",
                  is_intercampus: true
                },
                driver: {
                  name: "Jamie L.",
                  rating: 4.8,
                  college: "Stanford"
                }
              })
            }
          } else {
            // If no bookings in localStorage, use a demo booking
            setBooking({
              id: params.id as string,
              ride_id: "demo-ride-1",
              seats_booked: 1,
              status: "confirmed",
              payment_status: "paid",
              ride: {
                id: "demo-ride-1",
                from_location: "Stanford Campus",
                to_location: `${selectedCollege?.abbreviation || 'Campus'} Campus`,
                departure_time: "2025-05-02T14:00:00",
                seats_available: 1,
                price_per_seat: 8,
                status: "active",
                is_intercampus: true
              },
              driver: {
                name: "Jamie L.",
                rating: 4.8,
                college: "Stanford"
              }
            })
          }
        }
      } catch (err) {
        console.error("Error fetching booking data:", err)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [params.id, selectedCollege])

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  // Handle booking cancellation
  const handleCancelBooking = () => {
    try {
      // Get existing bookings from localStorage
      const storedBookingsJSON = localStorage.getItem('rideBookings')
      if (!storedBookingsJSON) {
        throw new Error('No bookings found in localStorage')
      }
      
      const storedBookings = JSON.parse(storedBookingsJSON)
      
      // Find the booking to cancel
      const updatedBookings = storedBookings.map((b: Booking) => {
        if (b.id === params.id) {
          return { ...b, status: 'cancelled' }
        }
        return b
      })
      
      // Save updated bookings to localStorage
      localStorage.setItem('rideBookings', JSON.stringify(updatedBookings))
      
      // Find the ride that was booked and update its seat availability
      const bookingToCancel = storedBookings.find((b: Booking) => b.id === params.id)
      if (bookingToCancel) {
        // Get all rides from localStorage
        const storedRidesJSON = localStorage.getItem('offeredRides')
        if (storedRidesJSON) {
          const storedRides = JSON.parse(storedRidesJSON)
          
          // Update the available seats for the ride
          const updatedRides = storedRides.map((ride: any) => {
            if (ride.id === bookingToCancel.ride_id) {
              return { 
                ...ride, 
                seats_available: ride.seats_available + bookingToCancel.seats_booked 
              }
            }
            return ride
          })
          
          // Save updated rides to localStorage
          localStorage.setItem('offeredRides', JSON.stringify(updatedRides))
        }
      }
      
      // Show success toast
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      })
      
      // Update booking state
      setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null)
      
    } catch (error) {
      console.error('Error cancelling booking:', error)
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Booking not found
          </div>
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => router.push('/my-rides')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to My Rides
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">Booking Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Booking Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Ride Information</CardTitle>
                <Badge className={
                  booking.status === "confirmed" ? "bg-green-100 text-green-800" : 
                  booking.status === "cancelled" ? "bg-red-100 text-red-800" : 
                  "bg-gray-100 text-gray-800"
                }>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {booking.from || (booking.ride?.from_location || "Unknown")} → {booking.to || (booking.ride?.to_location || "Unknown")}
                    </h3>
                    <div className="flex items-center">
                      {((booking.ride?.is_intercampus === true) || booking.isIntercampus) && (
                        <Badge className="mr-2 bg-blue-500">Intercampus</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-700">
                      {formatDate(booking.departure_time || (booking.ride?.departure_time || new Date().toISOString()))}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-700">Seats Booked: <span className="font-medium">{booking.seats_booked}</span></span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-700">
                      Price: <span className="font-medium">
                        ${(booking.price || (booking.ride?.price_per_seat || 0)) * (booking.seats_booked || 1)}
                      </span>
                    </span>
                    <div>
                      <Badge variant={booking.payment_status === "paid" ? "default" : "outline"} 
                            className={booking.payment_status === "paid" ? "bg-green-100 text-green-800" : ""}>
                        {(booking.payment_status || "pending").charAt(0).toUpperCase() + (booking.payment_status || "pending").slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Coffee className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-700">Pit Stop: <span className="font-medium text-rose-600">Starbucks (10% off)</span></span>
                  </div>
                </div>
              </div>
              
              {booking.status === "confirmed" && (
                <div className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Driver Info */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Driver" />
                  <AvatarFallback className="text-xl">
                    {booking.driver?.name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mt-2">{booking.driver?.name || "Jamie L."}</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                  <span className="text-gray-700">{booking.driver?.rating || 4.8}</span>
                </div>
                <Badge variant="outline" className="mt-2 flex items-center">
                  <School className="h-3 w-3 mr-1" />
                  {booking.driver?.college || "Stanford"}
                </Badge>
              </div>
              
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Contact Number:</span>
                  <span className="font-medium">(555) 123-4567</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">jamie.l@example.edu</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">Honda Civic (White)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">License Plate:</span>
                  <span className="font-medium">RDR-123</span>
                </div>
              </div>
              
              <Button className="w-full mt-6">
                Contact Driver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
} 
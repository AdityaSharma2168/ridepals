"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Clock, Users, Car, Coffee, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import RideMap from "@/components/ride-map"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useCollege } from "@/contexts/college-context"
import { useAuth } from "@/contexts/auth-context"

// Define ride pricing constants
const BASE_FARE = 2.00;               // Base platform fee
const COST_PER_MILE = 0.75;           // Cost per mile
const COST_PER_MINUTE = 0.10;         // Cost per minute
const MIN_FARE = 3.00;                // Minimum fare
const MAX_FARE_PER_MILE = 1.50;       // Maximum fare per mile cap

// Days of the week for recurring rides
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// Define available pit stops
const AVAILABLE_PITSTOPS = [
  {
    id: "pitstop-boba",
    name: "Boba Guys",
    location: "University Avenue, Palo Alto",
    discount: "10% off",
    coordinates: { lat: 37.4470, lng: -122.1600 }, // Example coordinates
  },
  {
    id: "pitstop-coupa",
    name: "Coupa Café",
    location: "Lytton Avenue, Palo Alto",
    discount: "Free cookie",
    coordinates: { lat: 37.4450, lng: -122.1630 }, // Example coordinates
  },
  {
    id: "pitstop-ikes",
    name: "Ike's Sandwiches",
    location: "Stanford Shopping Center",
    discount: "$2 off",
    coordinates: { lat: 37.4410, lng: -122.1700 }, // Example coordinates
  },
];

// Function to handle map distance/duration updates
const handleDistanceUpdate = (newDistance: number, setDistance: React.Dispatch<React.SetStateAction<number>>) => {
  setDistance(newDistance);
};

const handleDurationUpdate = (newDuration: number, setDuration: React.Dispatch<React.SetStateAction<number>>) => {
  setDuration(newDuration);
};

// Calculate ride price based on estimated distance and duration
const calculateRidePrice = (distance: number, duration: number): { 
  total: number, 
  distanceComponent: string, 
  timeComponent: string, 
  platformFee: string 
} => {
  // Calculate price components
  const distanceComponent = Math.min(distance * COST_PER_MILE, distance * MAX_FARE_PER_MILE);
  const timeComponent = duration * COST_PER_MINUTE;
  const platformFee = BASE_FARE;
  
  // Calculate total price
  let total = distanceComponent + timeComponent + platformFee;
  
  // Apply minimum fare if necessary
  total = Math.max(total, MIN_FARE);
  
  return { 
    total, 
    distanceComponent: distanceComponent.toFixed(2), 
    timeComponent: timeComponent.toFixed(2), 
    platformFee: platformFee.toFixed(2) 
  };
};

export default function OfferRidePage() {
  const router = useRouter()
  const { selectedCollege } = useCollege()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // Form state
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [seats, setSeats] = useState("2 seats")
  const [vehicle, setVehicle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  
  // Ride estimates
  const [distance, setDistance] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [calculatedPrice, setCalculatedPrice] = useState(5)  // Default example price
  
  // Add state for selected pit stops
  const [selectedPitStops, setSelectedPitStops] = useState<string[]>([])
  
  // Add a reference to store map markers
  const [mapMarkers, setMapMarkers] = useState<any[]>([])
  
  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?callbackUrl=/offer')
      return
    }
    
    // Set default "from" location using college
    if (selectedCollege?.abbreviation) {
      setFrom(`${selectedCollege.abbreviation} Campus`)
    }
  }, [user, authLoading, router, selectedCollege])
  
  // Calculate price based on current distance and duration
  const priceBreakdown = calculateRidePrice(distance, duration);
  
  // Update the state with the price breakdown total
  useEffect(() => {
    // Add logging to debug price calculation
    console.log("Distance:", distance, "Duration:", duration);
    console.log("Price breakdown:", priceBreakdown);
    setCalculatedPrice(priceBreakdown.total);
  }, [distance, duration, priceBreakdown.total]);
  
  // Handle pit stop selection
  const handlePitStopToggle = (pitStopId: string) => {
    if (selectedPitStops.includes(pitStopId)) {
      setSelectedPitStops(selectedPitStops.filter(id => id !== pitStopId))
    } else {
      setSelectedPitStops([...selectedPitStops, pitStopId])
    }
  }
  
  // Update the route whenever pit stops change
  useEffect(() => {
    if (from && to && selectedPitStops.length > 0) {
      console.log("Recalculating route with pit stops:", selectedPitStops);
      // This would be where we update the route with the selected pit stops
      // In a real implementation, we would pass these to the map component
      // to recalculate the route
    }
  }, [from, to, selectedPitStops]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Get the selected pit stop details
    const pitStops = selectedPitStops.map(pitStopId => {
      const pitStop = AVAILABLE_PITSTOPS.find(ps => ps.id === pitStopId);
      return pitStop ? {
        id: pitStop.id,
        name: pitStop.name,
        location: pitStop.location,
        discount: pitStop.discount,
        coordinates: pitStop.coordinates
      } : null;
    }).filter(Boolean);
    
    // Create a formatted ride object
    const newRide = {
      id: `ride-${Date.now()}`,
      from_location: from,
      to_location: to,
      departure_time: `${date}T${time}:00`,
      seats_available: parseInt(seats),
      price_per_seat: calculatedPrice,
      description: `Ride from ${from} to ${to}`,
      status: "active",
      is_intercampus: to.toLowerCase().includes("campus") && from.toLowerCase().includes("campus"),
      is_recurring: isRecurring,
      recurring_days: isRecurring ? selectedDays : [],
      created_at: new Date().toISOString(),
      // Store college-specific information
      college: {
        id: selectedCollege?.id || "unknown",
        name: selectedCollege?.name || "Unknown College",
        abbreviation: selectedCollege?.abbreviation || "UC",
      },
      // Store route information
      route: {
        distance_miles: distance,
        duration_minutes: duration,
        start_coords: { /* This would come from the actual map component */ },
        end_coords: { /* This would come from the actual map component */ },
      },
      // Store available seats for booking
      seats_total: parseInt(seats),
      seats_booked: 0,
      passengers: [],
      // Include selected pit stops
      pit_stops: pitStops
    }
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Log for debugging
    console.log("Submitting ride:", newRide)
    
    try {
      // Save the ride to local storage
      const existingRidesJSON = localStorage.getItem('offeredRides')
      const existingRides = existingRidesJSON ? JSON.parse(existingRidesJSON) : []
      localStorage.setItem('offeredRides', JSON.stringify([...existingRides, newRide]))
      
      // Show success toast and redirect
      toast({
        title: "Ride offered successfully!",
        description: "Your ride has been posted and is now available to passengers.",
        duration: 5000,
      })
      
      // Redirect to my rides page
      router.push('/my-rides')
    } catch (error) {
      console.error("Error saving ride:", error)
      toast({
        title: "Error offering ride",
        description: "There was an error posting your ride. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Toggle recurring ride
  const handleRecurringToggle = (checked: boolean) => {
    setIsRecurring(checked)
    if (!checked) {
      setSelectedDays([])
    }
  }
  
  // Toggle day selection for recurring rides
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }
  
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
        <h1 className="text-3xl font-bold mb-6">Offer a Ride</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ride Details</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="from">From</Label>
                      <div className="relative mt-1">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input 
                          id="from" 
                          placeholder="Pickup location" 
                          className="pl-10" 
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="to">To</Label>
                      <div className="relative mt-1">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input 
                          id="to" 
                          placeholder="Destination" 
                          className="pl-10" 
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <div className="relative mt-1">
                          <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input 
                            id="date" 
                            type="date" 
                            className="pl-10" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="time">Time</Label>
                        <div className="relative mt-1">
                          <Clock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input 
                            id="time" 
                            type="time" 
                            className="pl-10"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="seats">Available Seats</Label>
                      <div className="relative mt-1">
                        <Users
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <select
                          id="seats"
                          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                          value={seats}
                          onChange={(e) => setSeats(e.target.value)}
                        >
                          <option>1 seat</option>
                          <option>2 seats</option>
                          <option>3 seats</option>
                          <option>4 seats</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="car">Vehicle</Label>
                      <div className="relative mt-1">
                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input 
                          id="car" 
                          placeholder="Toyota Prius (Blue)" 
                          className="pl-10"
                          value={vehicle}
                          onChange={(e) => setVehicle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-lg font-medium mb-2">Pit Stop Options</h3>
                      <p className="text-sm text-gray-500 mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Select a pit stop to earn rewards and help fellow students
                      </p>

                      <div className="space-y-2">
                        {AVAILABLE_PITSTOPS.map((pitStop) => (
                          <div key={pitStop.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={pitStop.id} 
                              checked={selectedPitStops.includes(pitStop.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handlePitStopToggle(pitStop.id);
                                } else {
                                  handlePitStopToggle(pitStop.id);
                                }
                              }}
                            />
                            <Label htmlFor={pitStop.id} className="flex items-center">
                              <Coffee className="h-4 w-4 mr-2 text-rose-500" />
                              {pitStop.name} ({pitStop.discount})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">Recurring Ride</h3>
                          <p className="text-sm text-gray-500">
                            Offer this ride on a regular schedule
                          </p>
                        </div>
                        <Switch checked={isRecurring} onCheckedChange={handleRecurringToggle} />
                      </div>
                      
                      {isRecurring && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                          {DAYS_OF_WEEK.map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={selectedDays.includes(day) ? "default" : "outline"}
                              className={`text-sm ${selectedDays.includes(day) ? "" : "text-gray-700"}`}
                              onClick={() => toggleDay(day)}
                            >
                              {day.substring(0, 3)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Offer Ride"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Map Preview */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Route Preview</h2>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <RideMap 
                    onDistanceUpdate={(newDistance) => handleDistanceUpdate(newDistance, setDistance)}
                    onDurationUpdate={(newDuration) => handleDurationUpdate(newDuration, setDuration)}
                    startLocation={from}
                    endLocation={to}
                    pitStops={selectedPitStops
                      .map(id => {
                        const stop = AVAILABLE_PITSTOPS.find(p => p.id === id);
                        return stop ? {
                          id: stop.id,
                          name: stop.name,
                          location: stop.location,
                          discount: stop.discount,
                          coordinates: stop.coordinates
                        } : null;
                      })
                      .filter((stop): stop is {
                        id: string;
                        name: string;
                        location: string;
                        discount: string;
                        coordinates: { lat: number; lng: number };
                      } => stop !== null)
                    }
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-rose-500 mr-2" />
                      <span>Estimated Distance:</span>
                    </div>
                    <span className="font-medium">{distance.toFixed(1)} miles</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-rose-500 mr-2" />
                      <span>Estimated Time:</span>
                    </div>
                    <span className="font-medium">{duration.toFixed(0)} minutes</span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-lg">
                    <h3 className="font-medium text-rose-700 mb-2">Price Breakdown (per seat)</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Distance ({distance.toFixed(1)} miles @ ${COST_PER_MILE}/mile)</span>
                        <span>${priceBreakdown.distanceComponent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time ({duration.toFixed(0)} mins @ ${COST_PER_MINUTE}/min)</span>
                        <span>${priceBreakdown.timeComponent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Fare</span>
                        <span>${priceBreakdown.platformFee}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total Price</span>
                        <span className="text-rose-600">${calculatedPrice.toFixed(2)} per seat</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2 italic">
                    Price is calculated based on distance and duration. Our pricing is up to 40% lower than traditional rideshares.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

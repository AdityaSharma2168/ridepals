"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Users, Coffee, Car, Plus, Edit, Trash2, Calendar } from "lucide-react"
import RideMap from "@/components/ride-map"
import { useCollege } from "@/contexts/college-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Type for recurring ride
type RecurringRide = {
  id: string
  from_location: string
  to_location: string
  departure_time: string
  seats_available: number
  price_per_seat: number
  description?: string
  status: string
  is_intercampus: boolean
  is_recurring: boolean
  recurring_days: string[]
  created_at: string
}

export default function RecurringRidesPage() {
  const [activeTab, setActiveTab] = useState("my-rides")
  const [showNewRideForm, setShowNewRideForm] = useState(false)
  const [recurringRides, setRecurringRides] = useState<RecurringRide[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedCollege } = useCollege()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Check authentication and load recurring rides
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?callbackUrl=/recurring')
      return
    }
    
    // If user is authenticated, load recurring rides
    if (user) {
      loadRecurringRides()
    }
  }, [user, authLoading, router])

  // Load recurring rides from localStorage
  const loadRecurringRides = () => {
    setLoading(true)
    try {
      if (typeof window !== 'undefined') {
        // Debug logging
        console.log("All localStorage keys:", Object.keys(localStorage))
        
        const storedRidesJSON = localStorage.getItem('recurringRides')
        console.log("Raw recurring rides data:", storedRidesJSON)
        
        if (storedRidesJSON) {
          const storedRides = JSON.parse(storedRidesJSON)
          console.log("Loaded recurring rides:", storedRides)
          setRecurringRides(storedRides)
        } else {
          console.log("No recurring rides found in localStorage")
          setRecurringRides([])
        }
      }
    } catch (error) {
      console.error("Error loading recurring rides:", error)
      setRecurringRides([])
    } finally {
      setLoading(false)
    }
  }

  // Format a readable schedule from recurring days
  const formatSchedule = (days: string[]) => {
    if (!days || days.length === 0) return "Not specified"
    
    if (days.length === 7) return "Every day"
    if (days.length === 5 && 
        days.includes("Mon") && days.includes("Tue") && days.includes("Wed") &&
        days.includes("Thu") && days.includes("Fri")) 
      return "Every weekday"
    
    // Format as list of abbreviated days
    return days.map(day => day.substring(0, 1)).join(", ")
  }

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return "Invalid time"
    }
  }

  const handleDeleteRide = (id: string) => {
    if (confirm("Are you sure you want to delete this recurring ride?")) {
      try {
        const updatedRides = recurringRides.filter(ride => ride.id !== id)
        setRecurringRides(updatedRides)
        localStorage.setItem('recurringRides', JSON.stringify(updatedRides))
      } catch (error) {
        console.error("Error deleting ride:", error)
        alert("Failed to delete the ride. Please try again.")
      }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recurring Rides</h1>
          <Button onClick={() => setShowNewRideForm(!showNewRideForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Recurring Ride
          </Button>
        </div>

        {showNewRideForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>New Recurring Ride</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="from">From</Label>
                      <div className="relative mt-1">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input id="from" placeholder="Pickup location" className="pl-10" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="to">To</Label>
                      <div className="relative mt-1">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input id="to" placeholder="Destination" className="pl-10" />
                      </div>
                    </div>

                    <div>
                      <Label>Days of Week</Label>
                      <div className="grid grid-cols-7 gap-2 mt-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <Checkbox id={`day-${index}`} className="mb-1" />
                            <Label htmlFor={`day-${index}`} className="text-sm">
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="time">Time</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input id="time" type="time" className="pl-10" />
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
                        <Input id="car" placeholder="Toyota Prius (Blue)" className="pl-10" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-lg font-medium mb-2">Pit Stop Options</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="pitstop-boba" />
                          <Label htmlFor="pitstop-boba" className="flex items-center">
                            <Coffee className="h-4 w-4 mr-2 text-rose-500" />
                            Boba Guys (10% off)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="pitstop-coupa" />
                          <Label htmlFor="pitstop-coupa" className="flex items-center">
                            <Coffee className="h-4 w-4 mr-2 text-rose-500" />
                            Coupa Café (Free cookie)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                <div>
                  <Label>Route Preview</Label>
                  <div className="h-[300px] rounded-lg overflow-hidden mt-1">
                    <RideMap />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowNewRideForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    alert("Please use the Offer a Ride page to create recurring rides.")
                    setShowNewRideForm(false)
                  }}
                >
                  Create Recurring Ride
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="my-rides">My Recurring Rides</TabsTrigger>
            <TabsTrigger value="subscribed">Subscribed Rides</TabsTrigger>
            <TabsTrigger value="browse">Browse Recurring Rides</TabsTrigger>
          </TabsList>

          <TabsContent value="my-rides">
            {loading ? (
              <div className="text-center py-8">
                <p>Loading your recurring rides...</p>
              </div>
            ) : recurringRides.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No recurring rides yet</h3>
                <p className="text-gray-500 mb-4">Create a recurring ride by checking the "Make this a recurring ride" option when offering a ride.</p>
                <Button onClick={() => window.location.href = "/offer"}>
                  Offer a Ride
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {recurringRides.map((ride) => (
                  <Card key={ride.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{ride.from_location} → {ride.to_location}</h3>
                          <div className="text-sm text-gray-500">
                            {formatSchedule(ride.recurring_days)} at {formatTime(ride.departure_time)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="text-red-500"
                            onClick={() => handleDeleteRide(ride.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{ride.description || `${ride.from_location} → ${ride.to_location}`}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{ride.seats_available} seats available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span>${ride.price_per_seat.toFixed(2)} per seat</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscribed">
            <div className="text-center py-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No subscriptions yet</h3>
              <p className="text-gray-500 mb-4">You haven't subscribed to any recurring rides.</p>
              <Button onClick={() => setActiveTab("browse")}>
                Browse Recurring Rides
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 gap-6">
              {recurringRides.length === 0 ? (
                <div className="md:col-span-2 text-center py-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No recurring rides available</h3>
                  <p className="text-gray-500 mb-4">No one has created recurring rides yet.</p>
                </div>
              ) : (
                recurringRides.map((ride) => (
                  <Card key={ride.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{ride.from_location} → {ride.to_location}</h3>
                          <div className="text-sm text-gray-500">
                            {formatSchedule(ride.recurring_days)} at {formatTime(ride.departure_time)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{ride.description || `${ride.from_location} → ${ride.to_location}`}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{ride.seats_available} seats available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span>${ride.price_per_seat.toFixed(2)} per seat</span>
                        </div>
                      </div>

                      <div className="flex justify-end items-center">
                        <Button size="sm">Subscribe</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

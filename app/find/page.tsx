"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Search, Filter, ChevronDown, Users, School, Loader2 } from "lucide-react"
import CollegeSelector from "@/components/college-selector"
import { Badge } from "@/components/ui/badge"
import { useCollege } from "@/contexts/college-context"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

// API base URL
const API_BASE_URL = "http://localhost:8000";

// Type for ride data
type Ride = {
  id: string
  from: string
  to: string
  date: string
  time: string
  seats: number
  price: number
  driver: {
    name: string
    rating: number
    college: string
  }
  pitStop?: {
    name: string
    discount: string
  }
  isIntercampus: boolean
  distance?: number // Distance in miles from the search location
}

export default function FindRidePage() {
  const { selectedCollege, nearbyColleges } = useCollege()
  const { user } = useAuth()
  const [rides, setRides] = useState<Ride[]>([])
  const [filteredRides, setFilteredRides] = useState<Ride[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [includeIntercampus, setIncludeIntercampus] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [maxDistance, setMaxDistance] = useState(10) // Default max distance of 10 miles
  const [startLocation, setStartLocation] = useState("")
  const [date, setDate] = useState("")
  const [minSeats, setMinSeats] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch rides from the backend API when component mounts
  useEffect(() => {
    fetchInitialRides();
  }, [selectedCollege]);

  // Fetch initial rides when component loads
  const fetchInitialRides = async () => {
    try {
      setIsLoading(true);
      
      // Skip the actual API call and go straight to demo data
      // This avoids the error when API is not available
      console.log("Using demo data for rides");
      generateDemoRides();
      setSearchError(null);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setSearchError('Could not load rides. Using demo data instead.');
      generateDemoRides();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format API date string to our format
  const formatRideDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return format(date, 'EEE, MMM d');
    }
  };
  
  // Helper function to format API time string to our format
  const formatRideTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, 'h:mm a');
  };
  
  // Generate demo rides as a fallback
  const generateDemoRides = () => {
    // Local rides for the selected college
    const localRides: Ride[] = [
      {
        id: "1",
        from: `${selectedCollege?.abbreviation || 'Campus'} Dorms`,
        to: `${selectedCollege?.location || 'Local'} Downtown`,
        date: "Today",
        time: "5:30 PM",
        seats: 2,
        price: 4,
        driver: {
          name: "Jessica S.",
          rating: 4.9,
          college: selectedCollege?.abbreviation || 'Campus',
        },
        pitStop: {
          name: "Boba Guys",
          discount: "10% off",
        },
        isIntercampus: false,
        distance: 0.3, // Mock distance in miles
      },
      {
        id: "2",
        from: `${selectedCollege?.abbreviation || 'Campus'} Campus`,
        to: "Trader Joe's",
        date: "Today",
        time: "6:15 PM",
        seats: 3,
        price: 5,
        driver: {
          name: "Michael T.",
          rating: 4.7,
          college: selectedCollege?.abbreviation || 'Campus',
        },
        isIntercampus: false,
        distance: 1.8, // Mock distance in miles
      },
      {
        id: "3",
        from: `${selectedCollege?.location || 'Local'} Shopping Center`,
        to: `${selectedCollege?.abbreviation || 'Campus'} Campus`,
        date: "Tomorrow",
        time: "2:00 PM",
        seats: 1,
        price: 6,
        driver: {
          name: "Alex W.",
          rating: 4.8,
          college: selectedCollege?.abbreviation || 'Campus',
        },
        pitStop: {
          name: "Coupa Café",
          discount: "Free cookie",
        },
        isIntercampus: false,
        distance: 3.5, // Mock distance in miles
      },
    ]

    // Intercampus rides
    const intercampusRides: Ride[] = nearbyColleges
      .map((college, index) => ({
        id: `intercampus-${index}`,
        from: `${college.abbreviation} Campus`,
        to: `${selectedCollege?.abbreviation || 'Campus'} Campus`,
        date: index === 0 ? "Tomorrow" : "Friday",
        time: index === 0 ? "9:00 AM" : "2:00 PM",
        seats: 2 + index,
        price: 10 + index * 2,
        driver: {
          name: `${["Jamie", "Alex", "Taylor", "Jordan"][index % 4]} ${["L", "K", "M", "R"][index % 4]}.`,
          rating: 4.5 + index * 0.1,
          college: college.abbreviation,
        },
        isIntercampus: true,
        distance: 5 + index * 2, // Mock distance in miles
      }))
      .slice(0, 3) // Limit to 3 intercampus rides

    const newRides = [...localRides, ...intercampusRides]
    setRides(newRides)
    setFilteredRides(newRides)
  }

  // Handle search with API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Skip API call and just apply local filters to the demo data
      console.log("Filtering local rides data");
      
      // Make sure we have rides data to filter
      if (rides.length === 0) {
        generateDemoRides();
      }
      
      // Apply frontend filters
      filterRidesLocally(rides);
      
    } catch (error) {
      console.error('Error searching for rides:', error);
      setSearchError('Failed to search rides. Using local filtering instead.');
      
      // Fall back to local filtering
      filterRidesLocally(rides);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Local filtering for when API is unavailable or for additional frontend filters
  const filterRidesLocally = (allRides: Ride[]) => {
    let filtered = [...allRides];
    
    // Filter by tab
    if (activeTab === "local") {
      filtered = filtered.filter((ride) => !ride.isIntercampus);
    } else if (activeTab === "intercampus") {
      filtered = filtered.filter((ride) => ride.isIntercampus);
    } else if (activeTab === "weekend") {
      filtered = filtered.filter(
        (ride) => ride.date.toLowerCase().includes("sat") || ride.date.toLowerCase().includes("sun"),
      );
    }
    
    // Filter by destination search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ride) => 
          ride.to.toLowerCase().includes(lowerQuery) || 
          ride.from.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Filter by date if selected
    if (date) {
      const searchDate = new Date(date);
      const formattedSearchDate = format(searchDate, 'EEE, MMM d').toLowerCase();
      
      filtered = filtered.filter((ride) => {
        // Handle "Today" and "Tomorrow" cases
        if (ride.date === "Today") {
          const today = new Date();
          return format(today, 'yyyy-MM-dd') === date;
        } else if (ride.date === "Tomorrow") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return format(tomorrow, 'yyyy-MM-dd') === date;
        } else {
          // Compare the formatted date strings
          return ride.date.toLowerCase() === formattedSearchDate;
        }
      });
    }
    
    // Filter by minimum seats
    if (minSeats > 1) {
      filtered = filtered.filter((ride) => ride.seats >= minSeats);
    }
    
    // Filter by maximum distance if start location is provided
    if (startLocation && maxDistance) {
      filtered = filtered.filter((ride) => {
        if (ride.distance === undefined) return true;
        return ride.distance <= maxDistance;
      });
    }
    
    // Filter by intercampus preference
    if (!includeIntercampus) {
      filtered = filtered.filter((ride) => !ride.isIntercampus);
    }
    
    setFilteredRides(filtered);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    filterRidesLocally(rides);
  };

  // Handle intercampus toggle
  const handleIntercampusToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeIntercampus(e.target.checked);
    // Reapply filters when toggled
    setTimeout(() => filterRidesLocally(rides), 0);
  };

  // Handle distance change
  const handleDistanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxDistance(parseInt(e.target.value));
    // Reapply filters when distance changed
    setTimeout(() => filterRidesLocally(rides), 0);
  };
  
  // Handle min seats change
  const handleMinSeatsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinSeats(parseInt(e.target.value.split(' ')[0]));
    // Reapply filters when min seats changed
    setTimeout(() => filterRidesLocally(rides), 0);
  };
  
  // Handle search query change
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounce search to avoid excessive filtering
    const timeoutId = setTimeout(() => filterRidesLocally(rides), 300);
    return () => clearTimeout(timeoutId);
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    // Reapply filters when date changed
    setTimeout(() => filterRidesLocally(rides), 0);
  };
  
  // Handle start location change
  const handleStartLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartLocation(e.target.value);
    // Don't immediately filter as we'd need to geocode in a real app
  };

  // Add this function to handle ride booking
  const handleBookRide = (ride: Ride) => {
    try {
      // Get current user info for the booking
      const userInfo = {
        id: user?.uid || 'demo-user',
        name: user?.email?.split('@')[0] || 'Demo User',
        email: user?.email || 'demo@example.edu',
      };
      
      // Create a booking object
      const booking = {
        id: `booking-${Date.now()}`,
        ride_id: ride.id,
        user_id: userInfo.id,
        user_name: userInfo.name,
        user_email: userInfo.email,
        booking_time: new Date().toISOString(),
        status: 'confirmed',
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        price: ride.price,
        driver: ride.driver,
      };
      
      // Save booking to local storage
      const existingBookingsJSON = localStorage.getItem('rideBookings');
      const existingBookings = existingBookingsJSON ? JSON.parse(existingBookingsJSON) : [];
      localStorage.setItem('rideBookings', JSON.stringify([...existingBookings, booking]));
      
      // Update ride's available seats in local data
      const updatedRides = rides.map(r => {
        if (r.id === ride.id) {
          return { ...r, seats: r.seats - 1 };
        }
        return r;
      });
      
      // Update the rides state
      setRides(updatedRides);
      
      // Update filtered rides
      const updatedFilteredRides = filteredRides.map(r => {
        if (r.id === ride.id) {
          return { ...r, seats: r.seats - 1 };
        }
        return r;
      });
      
      // Remove the ride from filtered rides if no seats left
      const newFilteredRides = updatedFilteredRides.filter(r => r.seats > 0);
      
      setFilteredRides(newFilteredRides);
      
      // Show success toast
      toast({
        title: "Ride Booked Successfully!",
        description: `Your ride from ${ride.from} to ${ride.to} has been booked.`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error booking ride:', error);
      toast({
        title: "Error Booking Ride",
        description: "There was an error booking this ride. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find a Ride</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Search Rides</h2>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">College</label>
                    <CollegeSelector />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Starting Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        placeholder="Your starting location" 
                        className="pl-10"
                        value={startLocation}
                        onChange={handleStartLocationChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        type="date" 
                        className="pl-10"
                        value={date}
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Min. Seats</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={`${minSeats} ${minSeats === 1 ? 'seat' : 'seats'}`}
                        onChange={handleMinSeatsChange}
                      >
                        <option>1 seat</option>
                        <option>2 seats</option>
                        <option>3 seats</option>
                        <option>4 seats</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Distance</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={maxDistance}
                        onChange={handleDistanceChange}
                      >
                        <option value={5}>5 miles</option>
                        <option value={10}>10 miles</option>
                        <option value={25}>25 miles</option>
                        <option value={50}>50+ miles</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-intercampus"
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      checked={includeIntercampus}
                      onChange={handleIntercampusToggle}
                    />
                    <label htmlFor="include-intercampus" className="ml-2 block text-sm text-gray-700">
                      Include intercampus rides
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search Rides
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Rides</TabsTrigger>
                  <TabsTrigger value="local">Local</TabsTrigger>
                  <TabsTrigger value="intercampus">Intercampus</TabsTrigger>
                  <TabsTrigger value="weekend">Weekend</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative ml-4 flex-grow max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search destination..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                />
              </div>
            </div>

            {searchError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{searchError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                </div>
              ) : filteredRides.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow p-6">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <MapPin className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                  <p className="text-gray-500 mb-4">
                    {hasSearched
                      ? "No rides match your search criteria. Try adjusting your filters."
                      : "Start by searching for a ride above."}
                  </p>
                </div>
              ) : (
                filteredRides.map((ride) => (
                  <Card key={ride.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{ride.driver.name}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <span className="text-yellow-500 mr-1">★</span>
                                <span>{ride.driver.rating}</span>
                                <Badge variant="outline" className="ml-2">
                                  {ride.driver.college}
                                </Badge>
                                {ride.isIntercampus && (
                                  <Badge variant="secondary" className="ml-2">
                                    Intercampus
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-lg">${ride.price}</span>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium">
                                  {ride.from} → {ride.to}
                                </div>
                                {ride.distance !== undefined && (
                                  <div className="text-gray-500">
                                    {ride.distance.toFixed(1)} miles from your location
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{ride.date} at {ride.time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{ride.seats} seats available</span>
                            </div>
                            {ride.pitStop && (
                              <div className="flex items-center text-sm text-rose-600">
                                <span className="text-gray-400 mr-2">🍵</span>
                                <span>
                                  Pit stop: {ride.pitStop.name} ({ride.pitStop.discount})
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button 
                              onClick={() => handleBookRide(ride)} 
                              disabled={ride.seats <= 0}
                            >
                              {ride.seats > 0 ? "Book Seat" : "Fully Booked"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

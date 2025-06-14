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
import { supabase, searchRides, searchRidesWithDistance, createBooking } from "@/lib/supabase/client"

// Type for ride data from Supabase
type Ride = {
  id: string
  driver_id: string
  origin: string
  destination: string
  departure_time: string
  available_seats: number
  price_per_seat: number
  status: 'active' | 'completed' | 'cancelled'
  driver?: {
    full_name: string
    college_id: string
  }
}

// Type for display (keeping compatibility with existing UI)
type DisplayRide = {
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
  isIntercampus: boolean
  distance?: number
}

export default function FindRidePage() {
  const { selectedCollege, nearbyColleges } = useCollege()
  const { user } = useAuth()
  const [rides, setRides] = useState<DisplayRide[]>([])
  const [filteredRides, setFilteredRides] = useState<DisplayRide[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [includeIntercampus, setIncludeIntercampus] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [maxDistance, setMaxDistance] = useState(10)
  const [startLocation, setStartLocation] = useState("")
  const [date, setDate] = useState("")
  const [minSeats, setMinSeats] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Fetch rides from Supabase when component mounts
  useEffect(() => {
    fetchRidesFromSupabase();
    // Get user location for distance-based search
    getUserLocation();
  }, [selectedCollege]);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          setLocationError('Location access denied. Distance-based search unavailable.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  // Convert Supabase ride to display format
  const convertToDisplayRide = (ride: Ride): DisplayRide => {
    const departureDate = new Date(ride.departure_time)
    
    return {
      id: ride.id,
      from: ride.origin,
      to: ride.destination,
      date: formatRideDate(ride.departure_time),
      time: formatRideTime(ride.departure_time),
      seats: ride.available_seats,
      price: ride.price_per_seat,
      driver: {
        name: ride.driver?.full_name || 'Unknown Driver',
        rating: 4.8, // Default rating for now
        college: selectedCollege?.abbreviation || 'Unknown',
      },
      isIntercampus: false, // We'll determine this based on origin/destination
      distance: Math.random() * 10, // Mock distance for now
    }
  }

  // Fetch rides from Supabase
  const fetchRidesFromSupabase = async () => {
    try {
      setIsLoading(true);
      setSearchError(null);
      
      console.log("Fetching rides from Supabase...");
      
      const supabaseRides = await searchRides({
        excludeUserId: user?.id, // Exclude current user's own rides
      });
      
      if (supabaseRides && supabaseRides.length > 0) {
        // Filter out rides with 0 available seats
        const availableRides = supabaseRides.filter(ride => ride.available_seats > 0);
        const displayRides = availableRides.map(convertToDisplayRide);
        setRides(displayRides);
        setFilteredRides(displayRides);
        console.log(`Loaded ${displayRides.length} available rides from Supabase`);
      } else {
        console.log("No rides found in Supabase, using demo data");
        generateDemoRides();
      }
    } catch (error) {
      console.error('Error fetching rides from Supabase:', error);
      setSearchError('Could not load rides from database. Using demo data instead.');
      generateDemoRides();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date string
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
  
  // Helper function to format time string
  const formatRideTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, 'h:mm a');
  };
  
  // Generate demo rides as a fallback
  const generateDemoRides = () => {
    // Local rides for the selected college
    const localRides: DisplayRide[] = [
      {
        id: "demo-1",
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
        isIntercampus: false,
        distance: 0.3,
      },
      {
        id: "demo-2",
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
        distance: 1.8,
      },
      {
        id: "demo-3",
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
        isIntercampus: false,
        distance: 3.5,
      },
    ]

    // Intercampus rides
    const intercampusRides: DisplayRide[] = nearbyColleges
      .map((college, index) => ({
        id: `demo-intercampus-${index}`,
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
        distance: 5 + index * 2,
      }))
      .slice(0, 3)

    const newRides = [...localRides, ...intercampusRides]
    setRides(newRides)
    setFilteredRides(newRides)
  }

  // Enhanced search function with PostGIS distance search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSearchError(null)
    setHasSearched(true)

    try {
      const searchFilters = {
        origin: startLocation || undefined,
        destination: searchQuery || undefined,
        date: date || undefined,
        minSeats: minSeats > 1 ? minSeats : undefined,
        maxPrice: undefined, // Add price filter if needed
        excludeUserId: user?.id, // Exclude current user's own rides
        // Use PostGIS distance search if user location is available
        userLat: userLocation?.lat,
        userLng: userLocation?.lng,
        maxDistanceKm: userLocation ? maxDistance : undefined
      };

      console.log('🔍 Searching with filters:', searchFilters);

      // Use distance-aware search if location is available, otherwise use basic search
      const supabaseRides = userLocation ? 
        await searchRidesWithDistance(searchFilters) : 
        await searchRides(searchFilters);

      if (supabaseRides && supabaseRides.length > 0) {
        const displayRides = supabaseRides.map(convertToDisplayRide);
        setRides(displayRides);
        setFilteredRides(displayRides);
        console.log(`Found ${displayRides.length} rides`);
      } else {
        setRides([]);
        setFilteredRides([]);
        console.log('No rides found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Local filtering for when API is unavailable or for additional frontend filters
  const filterRidesLocally = (allRides: DisplayRide[]) => {
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
    
    return filtered;
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
  const handleBookRide = async (ride: DisplayRide) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a ride.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 Booking ride:', ride.id);
      
      const result = await createBooking({
        ride_id: ride.id,
        rider_id: user.id,
        seats_booked: 1, // Book 1 seat by default
      });

      if (result.error) {
        toast({
          title: "Booking Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Update the local ride data to reflect the booking
      const updatedRides = rides.map(r => {
        if (r.id === ride.id) {
          return { ...r, seats: r.seats - 1 };
        }
        return r;
      });
      setRides(updatedRides);

      // Update filtered rides and remove if no seats left
      const updatedFilteredRides = filteredRides.map(r => {
        if (r.id === ride.id) {
          return { ...r, seats: r.seats - 1 };
        }
        return r;
      });
      setFilteredRides(updatedFilteredRides.filter(r => r.seats > 0));

      // Show success toast
      toast({
        title: "Ride Booked Successfully! 🎉",
        description: `Your ride from ${ride.from} to ${ride.to} has been confirmed.`,
      });
      
    } catch (error) {
      console.error('💥 Error booking ride:', error);
      toast({
        title: "Error Booking Ride",
        description: "There was an error booking this ride. Please try again.",
        variant: "destructive",
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
                  
                  {/* Location Status Indicator */}
                  <div className="mt-4 p-3 rounded-lg border">
                    {userLocation ? (
                      <div className="flex items-center text-sm text-green-700 bg-green-50 p-2 rounded">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>📍 Location detected - Distance-based search enabled</span>
                      </div>
                    ) : locationError ? (
                      <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>⚠️ {locationError}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>🔍 Getting your location for better search results...</span>
                      </div>
                    )}
                  </div>
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

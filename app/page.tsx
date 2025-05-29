"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users, Coffee, Star, ChevronRight, Search, Check, School, Loader2, Navigation } from "lucide-react"
import RideMap from "@/components/ride-map"
import RestaurantCard from "@/components/restaurant-card"
import RecurringRideCard from "@/components/recurring-ride-card"
import CollegeSelector from "@/components/college-selector"
import { useCollege, type College } from "@/contexts/college-context"
import { useAuth } from "@/contexts/auth-context"
import { toast, useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { findNearbyLocations, getPopularStartingPoints, type Location } from "@/lib/campus-locations"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("available")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)
  const { selectedCollege, nearbyColleges } = useCollege()
  const { user } = useAuth()
  
  // New state for quick search
  const [startLocation, setStartLocation] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([])
  const [popularLocations, setPopularLocations] = useState<Location[]>([])

  // Load popular locations when college changes
  useEffect(() => {
    if (selectedCollege?.id) {
      const locations = getPopularStartingPoints(selectedCollege.id);
      setPopularLocations(locations);
    } else {
      setPopularLocations([]);
    }
  }, [selectedCollege]);

  // Generate popular restaurants data
  const getPopularRestaurants = () => {
    return [
      {
        name: "Five Guys",
        image: "/placeholder.svg?height=80&width=80",
        discount: "15% off",
        rating: 4.7,
        category: "Burgers",
      },
      {
        name: "Chipotle",
        image: "/placeholder.svg?height=80&width=80",
        discount: "Free guac with purchase",
        rating: 4.5,
        category: "Mexican",
      },
      {
        name: "Starbucks",
        image: "/placeholder.svg?height=80&width=80",
        discount: "$2 off any grande drink",
        rating: 4.6,
        category: "Coffee",
      },
    ]
  }

  const handleBookRide = () => {
    setShowBookingSuccess(true)
    setTimeout(() => setShowBookingSuccess(false), 3000)
  }

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsGettingLocation(true);
    setLocationError("");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Get the coordinates
        const { latitude, longitude } = position.coords;
        
        // Find nearby locations based on user's coordinates
        const nearby = findNearbyLocations(latitude, longitude, 10, 5);
        setNearbyLocations(nearby);
        
        if (nearby.length > 0) {
          // Use the closest location name
          const closestLocation = nearby[0];
          setStartLocation(`${closestLocation.name} (${closestLocation.distance?.toFixed(1)} mi)`);
          
          toast({
            title: "Location Found",
            description: `Found ${nearby.length} locations near you. Closest: ${closestLocation.name}`,
          });
        } else {
          // If no nearby locations found, just use coordinates
          setStartLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          
          toast({
            title: "Location Found",
            description: "No known campus locations nearby. Using coordinates instead.",
          });
        }
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
      }
    );
  };

  // Handle quick search
  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare URL params for redirection to find page
    const params = new URLSearchParams();
    if (startLocation) params.append('from', startLocation);
    if (searchDate) params.append('date', searchDate);
    
    // In a full implementation, redirect to find page with search parameters
    router.push(`/find?${params.toString()}`);
    
    // Toast for the demo
    toast({
      title: "Searching Rides",
      description: `Looking for rides from: ${startLocation || "Any location"}${searchDate ? `, on ${searchDate}` : ""}`,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Success notification */}
      {showBookingSuccess && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center z-50 animate-in slide-in-from-top">
          <Check className="h-5 w-5 mr-2" />
          Ride booked successfully!
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-rose-500 to-orange-500 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <div className="flex items-center mb-6">
              <Image src="/ridepals-logo.png" alt="ridepals logo" width={80} height={80} className="mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold animate-in slide-in-from-left duration-500">ridepals</h1>
            </div>
            <p className="text-lg md:text-xl mb-8 animate-in slide-in-from-left duration-500 delay-100">
              Share rides with verified college peers across the Bay Area, save money, and support local businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-left duration-500 delay-200">
              <Link href="/find">
                <Button
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all"
                >
                  Find a Ride
                </Button>
              </Link>
              <Link href="/offer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-rose-600 hover:bg-white/20 hover:text-white transition-all"
                >
                  Offer a Ride
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative animate-in slide-in-from-right duration-500">
            <div className="absolute -inset-0.5 bg-white/20 rounded-lg blur-sm"></div>
            <div className="bg-white/10 p-8 rounded-lg shadow-2xl relative flex items-center justify-center h-full">
              <Image
                src="/ridepals-logo.png"
                alt="ridepals logo"
                width={400}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* User College Section - Shows college if logged in, or signup prompt if not */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          {user ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome, {user.email?.split('@')[0] || 'Student'}</h2>
                <p className="text-gray-600">
                  You're connected with <span className="font-semibold">{selectedCollege?.name || 'your college'}</span> community
                </p>
              </div>
              <div>
                <Badge className="px-4 py-2 bg-rose-100 text-rose-800 border-rose-200 text-sm">
                  <School className="h-4 w-4 mr-2" />
                  {selectedCollege?.abbreviation || 'College'} Student
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Join your college community</h2>
                <p className="text-gray-600">
                  Sign up with your .edu email to connect with students from your campus
                </p>
              </div>
              <Link href="/auth/signup">
                <Button className="whitespace-nowrap">
                  Sign Up with .edu Email
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12">
          {/* How RidePals Works Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-center mb-10">How RidePals Works</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center text-center animate-fade-in animate-on-scroll">
                <div className="bg-rose-100 p-4 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Find or Offer a Ride</h3>
                <p className="text-gray-600">
                  Share rides with verified college students, making transportation safer and more reliable.
                </p>
                <div className="mt-4">
                  <Link href="/find">
                    <Button variant="outline" size="sm">Find a Ride</Button>
                  </Link>
                  <span className="mx-2">or</span>
                  <Link href="/offer">
                    <Button variant="outline" size="sm">Offer a Ride</Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center text-center animate-fade-in animate-on-scroll">
                <div className="bg-rose-100 p-4 rounded-full mb-4">
                  <Coffee className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Order Food for Pickup</h3>
                <p className="text-gray-600">
                  Order food from local restaurants and have it picked up by drivers who are already heading your way.
                </p>
                <div className="mt-4">
                  <Link href="/food">
                    <Button variant="outline" size="sm">Explore Restaurants</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-center mb-8">About RidePals</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3 flex justify-center">
                <div className="relative w-64 h-64">
                  <Image
                    src="/ridepals-logo.png"
                    alt="RidePals Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="md:w-2/3">
                <p className="text-gray-700 mb-4">
                  RidePals began with a simple idea: make college transportation more affordable, sustainable, and community-oriented. 
                  Founded by Bay Area college students who were frustrated with expensive, inconvenient transportation options, 
                  we built a platform specifically designed for the unique needs of college communities.
                </p>
                
                <p className="text-gray-700 mb-4">
                  Our mission is to connect students through shared rides while supporting local businesses through our restaurant 
                  order pickup feature. We provide gender filters to ensure women's safety and peace of mind when choosing rides. 
                  Plus, you can order from small businesses and restaurants like In-N-Out that aren't available on traditional food apps,
                  giving you access to unique local flavors while supporting the community.
                </p>
              </div>
            </div>
          </div>
          
          {/* Meet the Team Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mt-8">
            <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="flex flex-col items-center">
                <Image src="/adipic.jpg" alt="Aditya Sharma" width={120} height={120} className="rounded-full mb-4 object-cover" />
                <h3 className="text-xl font-semibold">Aditya Sharma</h3>
                <p className="text-gray-600">CEO</p>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/ridepals-logo.png" alt="Lokesh Kamanboina" width={120} height={120} className="rounded-full mb-4" />
                <h3 className="text-xl font-semibold">Lokesh Kamanboina</h3>
                <p className="text-gray-600">CTO/Co-Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
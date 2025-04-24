"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users, Coffee, Star, ChevronRight, Search, Check, School } from "lucide-react"
import RideMap from "@/components/ride-map"
import PitStopCard from "@/components/pit-stop-card"
import RecurringRideCard from "@/components/recurring-ride-card"
import Navbar from "@/components/navbar"
import CollegeSelector from "@/components/college-selector"
import { useCollege } from "@/contexts/college-context"

export default function Home() {
  const [activeTab, setActiveTab] = useState("available")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)
  const { selectedCollege, nearbyColleges } = useCollege()

  // Generate college-specific pit stops
  const getPitStops = () => {
    return [
      {
        name: `${selectedCollege.location} Boba`,
        image: "/placeholder.svg?height=80&width=80",
        discount: "10% off",
        rating: 4.8,
        category: "Bubble Tea",
      },
      {
        name: `${selectedCollege.abbreviation} Café`,
        image: "/placeholder.svg?height=80&width=80",
        discount: "Free cookie with purchase",
        rating: 4.6,
        category: "Coffee",
      },
      {
        name: "Ike's Sandwiches",
        image: "/placeholder.svg?height=80&width=80",
        discount: "$2 off any sandwich",
        rating: 4.7,
        category: "Sandwiches",
      },
    ]
  }

  const handleBookRide = () => {
    setShowBookingSuccess(true)
    setTimeout(() => setShowBookingSuccess(false), 3000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Success notification */}
      {showBookingSuccess && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center z-50 animate-in slide-in-from-top">
          <Check className="h-5 w-5 mr-2" />
          Ride booked successfully!
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-rose-500 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-20 bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <div className="flex items-center mb-6">
              <Image src="/ridepals-logo.png" alt="ridepals.ai logo" width={80} height={80} className="mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold animate-in slide-in-from-left duration-500">ridepals.ai</h1>
            </div>
            <p className="text-lg md:text-xl mb-8 animate-in slide-in-from-left duration-500 delay-100">
              Share rides with verified college peers across the Bay Area, save money, and support local businesses with
              purposeful pit stops.
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
                alt="ridepals.ai logo"
                width={400}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* College Selection Section */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Find rides at your college</h2>
              <p className="text-gray-600">Connect with students from your campus for safe, affordable rides</p>
            </div>
            <div className="w-full md:w-auto">
              <CollegeSelector className="w-full md:w-[300px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Map and Rides */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-4 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Find Rides</h2>
                <div
                  className={`relative w-full max-w-sm transition-all duration-300 ${isSearchFocused ? "ring-2 ring-rose-500 ring-opacity-50" : ""}`}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={`Where to in ${selectedCollege.location}?`}
                    className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:border-rose-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </div>
              </div>

              <div className="h-[400px] rounded-lg overflow-hidden mb-4">
                <RideMap />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="available">Available</TabsTrigger>
                  <TabsTrigger value="intercampus">Intercampus</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring</TabsTrigger>
                  <TabsTrigger value="my-rides">My Rides</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4">
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg?height=50&width=50" alt="Driver" />
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">Jessica S.</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                <span>4.9</span>
                                <Badge variant="outline" className="ml-2 flex items-center">
                                  <School className="h-3 w-3 mr-1" />
                                  {selectedCollege.abbreviation}
                                </Badge>
                              </div>
                            </div>
                            <span className="font-bold text-lg">$4</span>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium">
                                  {selectedCollege.abbreviation} Dorms → {selectedCollege.location} Downtown
                                </div>
                                <div className="text-gray-500">3.2 miles • 12 min</div>
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span>Today at 5:30 PM</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span>2 seats available</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-rose-600">Pit stop: {selectedCollege.location} Boba (10% off)</span>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button onClick={handleBookRide} className="transition-all hover:shadow-md">
                              Book Seat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg?height=50&width=50" alt="Driver" />
                          <AvatarFallback>MT</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">Michael T.</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                <span>4.7</span>
                                <Badge variant="outline" className="ml-2 flex items-center">
                                  <School className="h-3 w-3 mr-1" />
                                  {selectedCollege.abbreviation}
                                </Badge>
                              </div>
                            </div>
                            <span className="font-bold text-lg">$5</span>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium">{selectedCollege.abbreviation} Campus → Trader Joe's</div>
                                <div className="text-gray-500">2.8 miles • 10 min</div>
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span>Today at 6:15 PM</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span>3 seats available</span>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button onClick={handleBookRide} className="transition-all hover:shadow-md">
                              Book Seat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="intercampus" className="space-y-4">
                  {nearbyColleges.length > 0 ? (
                    nearbyColleges.slice(0, 2).map((college, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg?height=50&width=50" alt="Driver" />
                              <AvatarFallback>{college.abbreviation.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{index % 2 === 0 ? "Jamie L." : "Alex K."}</h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                    <span>{4.6 + index * 0.2}</span>
                                    <Badge variant="outline" className="ml-2 flex items-center">
                                      <School className="h-3 w-3 mr-1" />
                                      {college.abbreviation}
                                    </Badge>
                                  </div>
                                </div>
                                <span className="font-bold text-lg">${10 + index * 2}</span>
                              </div>

                              <div className="mt-3 space-y-2">
                                <div className="flex items-center text-sm">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                  <div>
                                    <div className="font-medium">
                                      {college.abbreviation} → {selectedCollege.abbreviation}
                                    </div>
                                    <div className="text-gray-500">Intercampus • {30 + index * 5} min</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  <span>{index === 0 ? "Tomorrow at 9:00 AM" : "Friday at 2:00 PM"}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                                  <span>{3 - index} seats available</span>
                                </div>
                                {index === 0 && (
                                  <div className="flex items-center text-sm">
                                    <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-rose-600">Pit stop: Philz Coffee (15% off)</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex justify-end">
                                <Button onClick={handleBookRide} className="transition-all hover:shadow-md">
                                  Book Seat
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <MapPin className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No intercampus rides available</h3>
                      <p className="text-gray-500 mb-4">Try changing your college or check back later</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recurring">
                  <div className="space-y-4">
                    <RecurringRideCard
                      driver="Alex W."
                      route={`${selectedCollege.abbreviation} → ${selectedCollege.location} Downtown`}
                      schedule="MWF at 5:30 PM"
                      price={4}
                      pitStop={`${selectedCollege.location} Boba`}
                      seats={2}
                    />
                    {nearbyColleges.length > 0 && (
                      <RecurringRideCard
                        driver="Sarah L."
                        route={`${selectedCollege.abbreviation} → ${nearbyColleges[0].abbreviation}`}
                        schedule="TTh at 8:00 AM"
                        price={12}
                        pitStop="Philz Coffee"
                        seats={3}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="my-rides">
                  <div className="space-y-4">
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg?height=50&width=50" alt="Driver" />
                            <AvatarFallback>JS</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">Your Upcoming Ride</h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                  <span>Tomorrow at 9:00 AM</span>
                                </div>
                              </div>
                              <Badge>Booked</Badge>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="font-medium">
                                    {selectedCollege.abbreviation} →{" "}
                                    {nearbyColleges.length > 0 ? nearbyColleges[0].abbreviation : "Downtown"}
                                  </div>
                                  <div className="text-gray-500">Intercampus • 35 min</div>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 text-gray-400 mr-2" />
                                <span>Driver: Jamie L. (4.8 ★)</span>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" size="sm" className="mr-2">
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Pit Stops and Community */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-4 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Popular Pit Stops</h2>
                <Link href="/pitstops">
                  <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 transition-colors">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {getPitStops().map((pitStop, index) => (
                  <PitStopCard
                    key={index}
                    name={pitStop.name}
                    image={pitStop.image}
                    discount={pitStop.discount}
                    rating={pitStop.rating}
                    category={pitStop.category}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-2xl font-bold mb-4">Bay Area Stats</h2>

              <div className="grid grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-gray-500 text-sm mb-1">CO₂ Saved</h3>
                    <p className="text-2xl font-bold text-green-600">3,240 kg</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-gray-500 text-sm mb-1">Rides Shared</h3>
                    <p className="text-2xl font-bold text-rose-600">8,582</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-gray-500 text-sm mb-1">Active Students</h3>
                    <p className="text-2xl font-bold text-blue-600">1,428</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-gray-500 text-sm mb-1">Colleges</h3>
                    <p className="text-2xl font-bold text-amber-600">12</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

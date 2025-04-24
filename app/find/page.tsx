"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Search, Filter, ChevronDown, Users, School } from "lucide-react"
import Navbar from "@/components/navbar"
import RideMap from "@/components/ride-map"
import CollegeSelector from "@/components/college-selector"
import { Badge } from "@/components/ui/badge"
import { useCollege } from "@/contexts/college-context"

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
}

export default function FindRidePage() {
  const { selectedCollege, nearbyColleges } = useCollege()
  const [rides, setRides] = useState<Ride[]>([])
  const [filteredRides, setFilteredRides] = useState<Ride[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [includeIntercampus, setIncludeIntercampus] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Generate college-specific rides
  useEffect(() => {
    // This would normally come from an API based on the selected college
    const generateRides = () => {
      // Local rides for the selected college
      const localRides: Ride[] = [
        {
          id: "1",
          from: `${selectedCollege.abbreviation} Dorms`,
          to: `${selectedCollege.location} Downtown`,
          date: "Today",
          time: "5:30 PM",
          seats: 2,
          price: 4,
          driver: {
            name: "Jessica S.",
            rating: 4.9,
            college: selectedCollege.abbreviation,
          },
          pitStop: {
            name: "Boba Guys",
            discount: "10% off",
          },
          isIntercampus: false,
        },
        {
          id: "2",
          from: `${selectedCollege.abbreviation} Campus`,
          to: "Trader Joe's",
          date: "Today",
          time: "6:15 PM",
          seats: 3,
          price: 5,
          driver: {
            name: "Michael T.",
            rating: 4.7,
            college: selectedCollege.abbreviation,
          },
          isIntercampus: false,
        },
        {
          id: "3",
          from: `${selectedCollege.location} Shopping Center`,
          to: `${selectedCollege.abbreviation} Campus`,
          date: "Tomorrow",
          time: "2:00 PM",
          seats: 1,
          price: 6,
          driver: {
            name: "Alex W.",
            rating: 4.8,
            college: selectedCollege.abbreviation,
          },
          pitStop: {
            name: "Coupa Café",
            discount: "Free cookie",
          },
          isIntercampus: false,
        },
      ]

      // Intercampus rides
      const intercampusRides: Ride[] = nearbyColleges
        .map((college, index) => ({
          id: `intercampus-${index}`,
          from: `${college.abbreviation} Campus`,
          to: `${selectedCollege.abbreviation} Campus`,
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
        }))
        .slice(0, 3) // Limit to 3 intercampus rides

      return [...localRides, ...intercampusRides]
    }

    const newRides = generateRides()
    setRides(newRides)
    filterRides(newRides, activeTab, includeIntercampus, searchQuery)
  }, [selectedCollege, nearbyColleges])

  // Filter rides based on tab, intercampus setting, and search query
  const filterRides = (allRides: Ride[], tab: string, includeIntercampus: boolean, query: string) => {
    let filtered = allRides

    // Filter by tab
    if (tab === "local") {
      filtered = filtered.filter((ride) => !ride.isIntercampus)
    } else if (tab === "intercampus") {
      filtered = filtered.filter((ride) => ride.isIntercampus)
    } else if (tab === "weekend") {
      filtered = filtered.filter(
        (ride) => ride.date.toLowerCase().includes("sat") || ride.date.toLowerCase().includes("sun"),
      )
    }

    // Filter by intercampus setting
    if (!includeIntercampus) {
      filtered = filtered.filter((ride) => !ride.isIntercampus)
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        (ride) => ride.from.toLowerCase().includes(lowerQuery) || ride.to.toLowerCase().includes(lowerQuery),
      )
    }

    setFilteredRides(filtered)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    filterRides(rides, value, includeIntercampus, searchQuery)
  }

  // Handle intercampus toggle
  const handleIntercampusToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeIntercampus(e.target.checked)
    filterRides(rides, activeTab, e.target.checked, searchQuery)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    filterRides(rides, activeTab, includeIntercampus, searchQuery)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

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
                    <label className="block text-sm font-medium mb-1">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input placeholder={`${selectedCollege.abbreviation} Campus`} className="pl-10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        placeholder="Destination"
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">When</label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Input type="date" className="pl-10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input type="time" className="pl-10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Seats</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500">
                        <option>1 seat</option>
                        <option>2 seats</option>
                        <option>3 seats</option>
                        <option>4+ seats</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="intercampus"
                      className="rounded text-rose-500 focus:ring-rose-500"
                      checked={includeIntercampus}
                      onChange={handleIntercampusToggle}
                    />
                    <label htmlFor="intercampus" className="text-sm">
                      Include intercampus rides
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Search Rides
                    </Button>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Filter className="mr-2 h-4 w-4" />
                      More Filters
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Map and Results */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="h-[400px]">
                  <RideMap />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Rides</TabsTrigger>
                <TabsTrigger value="local">Local</TabsTrigger>
                <TabsTrigger value="intercampus">Intercampus</TabsTrigger>
                <TabsTrigger value="weekend">Weekend</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredRides.length > 0 ? (
                  filteredRides.map((ride) => (
                    <Card key={ride.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold">
                                {ride.from} → {ride.to}
                              </h3>
                              <Badge variant="outline" className="ml-2 flex items-center text-xs">
                                <School className="h-3 w-3 mr-1" />
                                {ride.driver.college}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {ride.date} at {ride.time} • {ride.seats} seats available
                            </div>
                            {ride.pitStop && (
                              <div className="text-sm text-rose-600 mt-1">
                                Pit stop: {ride.pitStop.name} ({ride.pitStop.discount})
                              </div>
                            )}
                            {ride.isIntercampus && <div className="text-sm text-blue-600 mt-1">Intercampus ride</div>}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">${ride.price}</div>
                            <Button size="sm" className="mt-2">
                              Book
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No rides found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
                    <Button
                      onClick={() => {
                        setActiveTab("all")
                        setIncludeIntercampus(true)
                        setSearchQuery("")
                        filterRides(rides, "all", true, "")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}

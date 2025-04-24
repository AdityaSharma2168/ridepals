"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Users, Coffee, Car, Plus, Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import RideMap from "@/components/ride-map"

export default function RecurringRidesPage() {
  const [activeTab, setActiveTab] = useState("my-rides")
  const [showNewRideForm, setShowNewRideForm] = useState(false)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

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

                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="vehicle">Vehicle</Label>
                        <div className="relative mt-1">
                          <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <select
                            id="vehicle"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            <option>Toyota Prius (Blue)</option>
                            <option>Add New Vehicle</option>
                          </select>
                        </div>
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
                    alert("Recurring ride created!")
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
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">EVGR → Main Campus</h3>
                      <div className="text-sm text-gray-500">Every MWF at 8:30 AM</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>EVGR Building A → Main Quad</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>3 seats available</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Car className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Toyota Prius (Blue)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">2 subscribers</div>
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Campus → Downtown Palo Alto</h3>
                      <div className="text-sm text-gray-500">Every Friday at 5:30 PM</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Tresidder Union → University Avenue</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>2 seats available</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-rose-600">Pit stop: Boba Guys (10% off)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">3 subscribers</div>
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscribed">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Campus → Trader Joe's</h3>
                      <div className="text-sm text-gray-500">Every Saturday at 2:00 PM</div>
                      <div className="text-sm font-medium mt-1">Driver: Michael T.</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-500">
                      Unsubscribe
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Tresidder Union → Trader Joe's</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>4 seats total (3 subscribers)</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">EVGR → Downtown Palo Alto</h3>
                      <div className="text-sm text-gray-500">Every MWF at 5:30 PM</div>
                      <div className="text-sm font-medium mt-1">Driver: Alex W.</div>
                    </div>
                    <div className="font-bold">$4/ride</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>EVGR Building B → University Avenue</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>2 seats available</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-rose-600">Pit stop: Boba Guys (10% off)</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Campus → Stanford Shopping Center</h3>
                      <div className="text-sm text-gray-500">Every Saturday at 1:00 PM</div>
                      <div className="text-sm font-medium mt-1">Driver: Jessica S.</div>
                    </div>
                    <div className="font-bold">$5/ride</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>Main Quad → Stanford Shopping Center</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>3 seats available</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-rose-600">Pit stop: Coupa Café (Free cookie)</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

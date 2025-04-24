import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock, Users, Coffee, Car, DollarSign, Info } from "lucide-react"
import Navbar from "@/components/navbar"
import RideMap from "@/components/ride-map"

export default function OfferRidePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Offer a Ride</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ride Details</h2>

                <form className="space-y-6">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <div className="relative mt-1">
                          <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input id="date" type="date" className="pl-10" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="time">Time</Label>
                        <div className="relative mt-1">
                          <Clock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input id="time" type="time" className="pl-10" />
                        </div>
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
                        <Label htmlFor="price">Price per Seat</Label>
                        <div className="relative mt-1">
                          <DollarSign
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input id="price" type="number" placeholder="5" className="pl-10" />
                        </div>
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
                      <p className="text-sm text-gray-500 mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Add a pit stop to earn rewards and help fellow students
                      </p>

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

                        <div className="flex items-center space-x-2">
                          <Checkbox id="pitstop-ikes" />
                          <Label htmlFor="pitstop-ikes" className="flex items-center">
                            <Coffee className="h-4 w-4 mr-2 text-rose-500" />
                            Ike's Sandwiches ($2 off)
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="recurring" />
                        <Label htmlFor="recurring">Make this a recurring ride</Label>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Offer Ride</Button>
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
                  <RideMap />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-rose-500 mr-2" />
                      <span>Estimated Distance:</span>
                    </div>
                    <span className="font-medium">3.2 miles</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-rose-500 mr-2" />
                      <span>Estimated Time:</span>
                    </div>
                    <span className="font-medium">12 minutes</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-rose-500 mr-2" />
                      <span>Suggested Price:</span>
                    </div>
                    <span className="font-medium">$4-6 per seat</span>
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

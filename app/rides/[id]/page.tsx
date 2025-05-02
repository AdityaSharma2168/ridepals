"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Users,
  Coffee,
  Star,
  MessageCircle,
  ArrowLeft,
  Car,
  DollarSign,
  Share2,
  CreditCard,
} from "lucide-react"
import RideMap from "@/components/ride-map"

export default function RideDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const rideId = params.id

  // This would normally come from an API call based on the rideId
  const rideDetails = {
    id: rideId,
    driver: {
      name: "Jessica S.",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      badge: "Verified Junior",
      rides: 42,
    },
    route: {
      from: "EVGR",
      to: "Downtown Palo Alto",
      distance: "3.2 miles",
      duration: "12 min",
    },
    time: "Today at 5:30 PM",
    seats: {
      total: 4,
      available: 2,
      passengers: [
        { name: "Alex W.", avatar: "/placeholder.svg?height=40&width=40" },
        { name: "You", avatar: "/placeholder.svg?height=40&width=40", isYou: true },
      ],
    },
    price: 4,
    vehicle: {
      model: "Toyota Prius (2019)",
      color: "Blue",
    },
    pitStop: {
      name: "Boba Guys",
      discount: "10% off",
      time: "5:45 PM (estimated)",
    },
  }

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 hover:bg-gray-100" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Ride Details */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">Ride Details</CardTitle>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={rideDetails.driver.avatar || "/placeholder.svg"} alt={rideDetails.driver.name} />
                    <AvatarFallback>
                      {rideDetails.driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold text-lg">{rideDetails.driver.name}</h3>
                      <Badge variant="outline" className="ml-2">
                        {rideDetails.driver.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                      <span>{rideDetails.driver.rating}</span>
                      <span className="mx-2">•</span>
                      <span>{rideDetails.driver.rides} rides</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 p-0"
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Route</h4>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium">
                            {rideDetails.route.from} → {rideDetails.route.to}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rideDetails.route.distance} • {rideDetails.route.duration}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{rideDetails.time}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Vehicle</h4>
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                        <span>
                          {rideDetails.vehicle.model} • {rideDetails.vehicle.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Price</h4>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium text-lg">${rideDetails.price} per seat</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Passengers</h4>
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium">
                            {rideDetails.seats.total - rideDetails.seats.available}/{rideDetails.seats.total} seats
                            filled
                          </div>
                          <div className="flex items-center mt-2">
                            {rideDetails.seats.passengers.map((passenger, index) => (
                              <div key={index} className="flex flex-col items-center mr-4">
                                <Avatar className="h-8 w-8 mb-1">
                                  <AvatarImage src={passenger.avatar || "/placeholder.svg"} alt={passenger.name} />
                                  <AvatarFallback>
                                    {passenger.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{passenger.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Pit Stop</h4>
                      <div className="flex items-center">
                        <Coffee className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{rideDetails.pitStop.name}</div>
                          <div className="text-sm">
                            <span className="text-rose-600">{rideDetails.pitStop.discount}</span>
                            <span className="text-gray-500 ml-2">{rideDetails.pitStop.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  {showCancelConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 mr-2">Are you sure?</span>
                      <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>
                        No
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setShowCancelConfirm(false)
                          router.push("/my-rides")
                        }}
                      >
                        Yes, Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <RideMap interactive={false} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ride fare</span>
                    <span>${rideDetails.price}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span>$0.50</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${(rideDetails.price + 0.5).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h4>
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Visa •••• 4242</div>
                      <div className="text-xs text-gray-500">Expires 12/25</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ride Policies</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Cancellation Policy</h4>
                  <p className="text-gray-600">
                    Free cancellation up to 1 hour before the ride. After that, a $2 fee applies.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pit Stop</h4>
                  <p className="text-gray-600">
                    The driver has included a pit stop at Boba Guys. Estimated duration: 15 minutes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Community Guidelines</h4>
                  <p className="text-gray-600">
                    Please be respectful to your driver and fellow passengers. Arrive on time at the pickup location.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

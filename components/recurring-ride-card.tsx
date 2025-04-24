"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Coffee } from "lucide-react"

interface RecurringRideCardProps {
  driver: string
  route: string
  schedule: string
  price: number
  pitStop?: string
  seats: number
}

export default function RecurringRideCard({ driver, route, schedule, price, pitStop, seats }: RecurringRideCardProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold">{driver}'s Recurring Ride</h3>
          <span className="font-bold text-lg">${price}/ride</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <span>{route}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span>{schedule}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-gray-400 mr-2" />
            <span>{seats} seats available</span>
          </div>
          {pitStop && (
            <div className="flex items-center text-sm">
              <Coffee className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-rose-600">Pit stop: {pitStop}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => console.log("View details for", driver)}>
            View Details
          </Button>
          <Button onClick={() => setIsSubscribed(!isSubscribed)} variant={isSubscribed ? "outline" : "default"}>
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

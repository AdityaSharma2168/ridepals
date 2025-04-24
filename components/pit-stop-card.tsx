"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight } from "lucide-react"

interface PitStopCardProps {
  name: string
  image: string
  discount: string
  rating: number
  category: string
}

export default function PitStopCard({ name, image, discount, rating, category }: PitStopCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={`overflow-hidden transition-shadow ${isHovered ? "shadow-md" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => console.log(`Viewing details for ${name}`)}
    >
      <CardContent className="p-0">
        <div className="flex items-center p-3">
          <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3 flex-shrink-0">
            <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-gray-500">{category}</p>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                <span className="text-sm font-medium">{rating}</span>
              </div>
            </div>

            <Badge variant="outline" className="mt-1 bg-rose-50 text-rose-600 border-rose-200">
              {discount}
            </Badge>
          </div>

          {isHovered && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </CardContent>
    </Card>
  )
}

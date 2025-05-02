"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Star, Search, MapPin, Clock, Coffee, Utensils, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function PitStopsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login?callbackUrl=/pitstops')
    }
  }, [user, authLoading, router])

  const categories = [
    { id: "all", label: "All", icon: Coffee },
    { id: "food", label: "Food", icon: Utensils },
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
  ]

  const pitStops = [
    {
      id: 1,
      name: "Boba Guys",
      category: "coffee",
      image: "/placeholder.svg?height=200&width=200",
      discount: "10% off any drink",
      rating: 4.8,
      location: "University Avenue, Palo Alto",
      hours: "9:00 AM - 9:00 PM",
      description: "Premium bubble tea with organic ingredients and unique flavors.",
    },
    {
      id: 2,
      name: "Coupa Café",
      category: "coffee",
      image: "/placeholder.svg?height=200&width=200",
      discount: "Free cookie with purchase",
      rating: 4.6,
      location: "Lytton Avenue, Palo Alto",
      hours: "7:00 AM - 7:00 PM",
      description: "Venezuelan coffee shop with a variety of pastries and sandwiches.",
    },
    {
      id: 3,
      name: "Ike's Sandwiches",
      category: "food",
      image: "/placeholder.svg?height=200&width=200",
      discount: "$2 off any sandwich",
      rating: 4.7,
      location: "Stanford Shopping Center",
      hours: "10:00 AM - 8:00 PM",
      description: "Creative sandwiches with unique combinations and flavors.",
    },
    {
      id: 4,
      name: "Stanford Bookstore",
      category: "shopping",
      image: "/placeholder.svg?height=200&width=200",
      discount: "15% off Stanford merchandise",
      rating: 4.5,
      location: "White Plaza, Stanford",
      hours: "9:00 AM - 6:00 PM",
      description: "Official Stanford University bookstore with apparel, books, and gifts.",
    },
  ]

  const filteredPitStops = pitStops.filter(
    (pitStop) =>
      (activeTab === "all" || pitStop.category === activeTab) &&
      (searchQuery === "" || pitStop.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const [selectedPitStop, setSelectedPitStop] = useState<number | null>(null)

  // Show loading indicator if auth check is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Pit Stops</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search pit stops..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>View Map</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                <category.icon className="mr-2 h-4 w-4" />
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPitStops.map((pitStop) => (
                <Card
                  key={pitStop.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPitStop(selectedPitStop === pitStop.id ? null : pitStop.id)}
                >
                  <div className="relative h-48 w-full">
                    <Image src={pitStop.image || "/placeholder.svg"} alt={pitStop.name} fill className="object-cover" />
                    <Badge className="absolute top-2 right-2 bg-rose-500">{pitStop.discount}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{pitStop.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                        <span className="font-medium">{pitStop.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{pitStop.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{pitStop.hours}</span>
                      </div>
                    </div>

                    {selectedPitStop === pitStop.id && (
                      <div className="mt-4">
                        <p className="text-sm mb-4">{pitStop.description}</p>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            View Menu
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPitStops.length === 0 && (
              <div className="text-center py-12">
                <Coffee className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No pit stops found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

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

export default function RestaurantsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?callbackUrl=/restaurants')
      return
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
      name: "Spartans",
      category: "food",
      image: "/placeholder.svg?height=200&width=200",
      discount: "10% off any meal",
      rating: 4.8,
      location: "Downtown San Jose",
      hours: "10:00 AM - 10:00 PM",
      description: "Popular local eatery known for hearty meals and a student-friendly vibe."
    },
    {
      id: 2,
      name: "In-N-Out",
      category: "food",
      image: "/placeholder.svg?height=200&width=200",
      discount: "Free fries with any burger",
      rating: 4.7,
      location: "El Camino Real, Mountain View",
      hours: "10:30 AM - 1:00 AM",
      description: "Classic California burger chain famous for fresh ingredients and secret menu."
    }
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
        <h1 className="text-3xl font-bold mb-6">Restaurants/Food Spots</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search restaurants or food spots..."
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
                <h3 className="text-xl font-medium mb-2">No restaurants or food spots found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

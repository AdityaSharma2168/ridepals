"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  Car,
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Shield,
  Award,
  ThumbsUp,
  Camera,
  ChevronRight,
  Trash2,
  MessageCircle,
  Check,
  Plus,
  Coffee,
  School,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"
import CollegeSelector from "@/components/college-selector"

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState(
    "Junior at Stanford studying Computer Science. I regularly commute between campus and my apartment, and often go to Downtown areas and grocery stores on weekends. Always happy to share rides and meet new people from other Bay Area colleges!",
  )
  const [showEditSuccess, setShowEditSuccess] = useState(false)
  const [college, setCollege] = useState({ name: "Stanford University", abbreviation: "Stanford" })

  const handleSaveProfile = () => {
    setEditMode(false)
    setShowEditSuccess(true)

    setTimeout(() => {
      setShowEditSuccess(false)
    }, 3000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {showEditSuccess && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center z-50 animate-in slide-in-from-top">
          <Check className="h-5 w-5 mr-2" />
          Profile updated successfully!
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 h-24"></div>
              <CardContent className="p-6 pt-0 -mt-12">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-white h-8 w-8 shadow-md hover:bg-gray-100"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  <h1 className="text-2xl font-bold mb-1">Sam Taylor</h1>
                  <p className="text-gray-500 mb-2">sam.taylor@stanford.edu</p>

                  <Badge className="mb-3 flex items-center bg-blue-50 text-blue-600 border-blue-200">
                    <School className="h-3 w-3 mr-1" /> {college.abbreviation}
                  </Badge>

                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" />
                      <span className="font-medium">4.9</span>
                      <span className="text-gray-500 ml-1">(24 ratings)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">
                      <Shield className="h-3 w-3 mr-1" /> Verified Student
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      <Award className="h-3 w-3 mr-1" /> Top Driver
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <ThumbsUp className="h-3 w-3 mr-1" /> Punctual
                    </Badge>
                  </div>

                  <Button className="w-full mb-2" onClick={() => setEditMode(!editMode)}>
                    {editMode ? "Cancel Editing" : "Edit Profile"}
                  </Button>
                  <Button variant="outline" className="w-full">
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Rides Taken</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Rides Offered</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Intercampus Rides</span>
                    <span className="font-medium text-blue-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">CO₂ Saved</span>
                    <span className="font-medium text-green-600">42 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Money Saved</span>
                    <span className="font-medium text-amber-600">$124</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pit Stop Visits</span>
                    <span className="font-medium text-rose-600">15</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rides">My Rides</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>About Me</CardTitle>
                    {editMode && (
                      <div className="w-[200px]">
                        <CollegeSelector onSelect={(selected) => setCollege(selected)} defaultCollege="stanford" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px]"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                      </div>
                    ) : (
                      <p>{bio}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>My Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="bg-gray-100 p-3 rounded-md">
                        <Car className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Toyota Prius (2019)</h3>
                        <p className="text-gray-500">Blue • 4 seats available</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {editMode && (
                      <Button variant="outline" className="mt-4 w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Rides</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">EVGR → Downtown Palo Alto</h3>
                          <Badge>Driver</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Today at 5:30 PM</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>2 passengers</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => router.push("/rides/1")}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Stanford → UC Berkeley</h3>
                          <Badge variant="outline">Passenger</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Tomorrow at 9:00 AM</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>4 passengers total</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <School className="h-4 w-4 mr-2" />
                            <span>Intercampus ride</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => router.push("/rides/3")}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rides" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Rides</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">EVGR → Downtown Palo Alto</h3>
                          <Badge>Driver</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Today at 5:30 PM</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>2 passengers</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Coffee className="h-4 w-4 mr-2" />
                            <span className="text-rose-600">Pit stop: Boba Guys (10% off)</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Cancel Ride
                          </Button>
                          <Button size="sm" onClick={() => router.push("/rides/1")}>
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Campus → Trader Joe's</h3>
                          <Badge variant="outline">Passenger</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Tomorrow at 4:00 PM</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>3 passengers total</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span>Chat with driver</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Cancel Booking
                          </Button>
                          <Button size="sm" onClick={() => router.push("/rides/2")}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Past Rides</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Stanford Shopping Center → Campus</h3>
                          <Badge>Driver</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>May 15, 2023</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>3 passengers</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" variant="outline">
                            View Receipt
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Downtown Palo Alto → EVGR</h3>
                          <Badge variant="outline">Passenger</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>May 12, 2023</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>2 passengers total</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            View Receipt
                          </Button>
                          <Button size="sm">Leave Review</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recurring" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Recurring Rides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">EVGR → Main Campus</h3>
                            <Badge className="mt-1">Driver</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              Cancel
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Every MWF</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>8:30 AM</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>EVGR Building A → Main Quad</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>3 seats available</span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">Campus → Trader Joe's</h3>
                            <Badge className="mt-1" variant="outline">
                              Passenger
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            Unsubscribe
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Every Saturday</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>2:00 PM</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>Tresidder Union → Trader Joe's</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => router.push("/recurring")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create New Recurring Ride
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Reviews (24)</CardTitle>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" />
                      <span className="font-bold text-lg">4.9</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alex" />
                            <AvatarFallback>AW</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className="font-medium mr-2">Alex W.</h3>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Sam is an excellent driver! Very punctual and friendly. The car was clean and the ride was
                              smooth.
                            </p>
                            <span className="text-xs text-gray-500">May 15, 2023</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Jessica" />
                            <AvatarFallback>JS</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className="font-medium mr-2">Jessica S.</h3>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Great ride! Sam was on time and we had a nice conversation. Would definitely ride with
                              again.
                            </p>
                            <span className="text-xs text-gray-500">May 10, 2023</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Michael" />
                            <AvatarFallback>MT</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h3 className="font-medium mr-2">Michael T.</h3>
                              <div className="flex">
                                {[1, 2, 3, 4].map((star) => (
                                  <Star key={star} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                ))}
                                {[5].map((star) => (
                                  <Star key={star} className="h-4 w-4 text-gray-300" fill="currentColor" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Sam is a reliable driver. The pit stop at Boba Guys was a nice bonus!
                            </p>
                            <span className="text-xs text-gray-500">May 5, 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex justify-center">
                      <Button variant="outline">Load More Reviews</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}

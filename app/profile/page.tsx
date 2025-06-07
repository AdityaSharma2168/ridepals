"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, School, Star, Upload, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
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
  Leaf,
} from "lucide-react"
import CollegeSelector from "@/components/college-selector"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  
  // Function to extract school name from email domain
  const getSchoolFromEmail = (email: string) => {
    if (!email) return "College not specified"
    
    const domain = email.split('@')[1]?.toLowerCase()
    
    // Map common .edu domains to school names
    const schoolMap: { [key: string]: string } = {
      'stanford.edu': 'Stanford University',
      'berkeley.edu': 'UC Berkeley',
      'sjsu.edu': 'San Jose State University',
      'scu.edu': 'Santa Clara University',
      'ucsf.edu': 'UC San Francisco',
      'ccsf.edu': 'City College of San Francisco',
      'ohlone.edu': 'Ohlone College',
      'deanza.edu': 'De Anza College',
      'foothill.edu': 'Foothill College',
      'calbaptist.edu': 'California Baptist University',
      'cpp.edu': 'Cal Poly Pomona',
      'calpoly.edu': 'Cal Poly San Luis Obispo',
      'ucdavis.edu': 'UC Davis'
    }
    
    return schoolMap[domain] || `${domain?.split('.')[0]?.toUpperCase()} University`
  }
  
  // User stats data - all set to 0
  const userStats = {
    co2Saved: 0, // kg
    ridesShared: 0,
    totalDistance: 0, // miles
    ridesOffered: 0,
    ridesBooked: 0,
    moneyEarned: 0, // dollars
    moneySaved: 0, // dollars
  }
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/auth/login?callbackUrl=/profile")
      return
    }
    
    // If we have a user, fetch their extended profile data
    if (user) {
      fetchUserData()
    }
  }, [user, authLoading, router])
  
  // Fetch user data from the backend
  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/check")
      const data = await response.json()
      
      if (data.authenticated) {
        setUserData({
          first_name: "Demo", // These would come from your backend normally
          last_name: "User",
          college_name: getSchoolFromEmail(data.user?.email || user?.email || ""),
          average_rating: 4.8,
          ...data.user
        })
      } else {
        // This shouldn't happen since we already check auth state above
        console.error("User not authenticated according to backend check")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Error fetching user data")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    try {
      // Placeholder for profile update logic
      // In a real app, you would send a request to update the profile
      setTimeout(() => {
        setSuccess("Profile updated successfully")
      }, 500)
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    }
  }
  
  // Show loading indicator if auth check or data loading is in progress
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        </div>
      </div>
    )
  }
  
  // Don't render content if not authenticated (will redirect via useEffect)
  if (!user) {
    return null;
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      {success && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center z-50 animate-in slide-in-from-top">
          <Check className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={userData?.first_name || "User"} />
                  <AvatarFallback className="text-2xl">
                    {userData?.first_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{userData?.first_name} {userData?.last_name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center">
                  <School className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {userData?.college_name || "College not specified"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-sm">
                    Rating: {userData?.average_rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => setShowStats(!showStats)}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    {showStats ? "Hide Stats" : "View Stats"}
                  </Button>
                </div>
              </div>
              
              {/* Stats Section (conditionally displayed) */}
              {showStats && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Your RidePals Stats</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <Leaf className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <h4 className="text-xs text-gray-500">CO₂ Saved</h4>
                        <p className="text-xl font-bold text-green-600">{userStats.co2Saved} kg</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <Car className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <h4 className="text-xs text-gray-500">Rides Shared</h4>
                        <p className="text-xl font-bold text-blue-600">{userStats.ridesShared}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Distance:</span>
                        <span className="font-medium">{userStats.totalDistance} miles</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rides Offered:</span>
                        <span className="font-medium">{userStats.ridesOffered}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rides Booked:</span>
                        <span className="font-medium">{userStats.ridesBooked}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-rose-50 p-3 rounded-lg text-center">
                        <h4 className="text-xs text-gray-500">Money Earned</h4>
                        <p className="text-xl font-bold text-rose-600">${userStats.moneyEarned}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg text-center">
                        <h4 className="text-xs text-gray-500">Money Saved</h4>
                        <p className="text-xl font-bold text-amber-600">${userStats.moneySaved}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={userData?.first_name || ""}
                      placeholder="First Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={userData?.last_name || ""}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed. It is linked to your account.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("profileImage")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload new image
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-6">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
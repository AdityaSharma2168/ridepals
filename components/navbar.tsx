"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Bell, Car, Calendar, User, LogOut, MapPin } from "lucide-react"
import Logo from "./logo"
import CollegeSelector from "./college-selector"
import { useCollege } from "@/contexts/college-context"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { selectedCollege } = useCollege()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white shadow-sm"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* College & Location Selector (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            <CollegeSelector />
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {selectedCollege.location}, CA
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/find"
              className={`text-gray-700 hover:text-rose-600 font-medium transition-colors relative ${
                isActive("/find") ? "text-rose-600" : ""
              }`}
            >
              Find a Ride
              {isActive("/find") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"></span>
              )}
            </Link>
            <Link
              href="/offer"
              className={`text-gray-700 hover:text-rose-600 font-medium transition-colors relative ${
                isActive("/offer") ? "text-rose-600" : ""
              }`}
            >
              Offer a Ride
              {isActive("/offer") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"></span>
              )}
            </Link>
            <Link
              href="/recurring"
              className={`text-gray-700 hover:text-rose-600 font-medium transition-colors relative ${
                isActive("/recurring") ? "text-rose-600" : ""
              }`}
            >
              Recurring Rides
              {isActive("/recurring") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"></span>
              )}
            </Link>
            <Link
              href="/pitstops"
              className={`text-gray-700 hover:text-rose-600 font-medium transition-colors relative ${
                isActive("/pitstops") ? "text-rose-600" : ""
              }`}
            >
              Pit Stops
              {isActive("/pitstops") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-full"></span>
              )}
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Sam</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/my-rides">
                  <DropdownMenuItem>
                    <Car className="mr-2 h-4 w-4" />
                    <span>My Rides</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/recurring">
                  <DropdownMenuItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Recurring Rides</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {/* College Selector (Mobile) */}
            <div className="py-2">
              <CollegeSelector className="w-full" />
              <div className="text-sm text-gray-500 flex items-center mt-2">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedCollege.location}, CA
              </div>
            </div>

            <div className="border-t pt-2">
              <Link
                href="/find"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive("/find") ? "text-rose-600 bg-rose-50" : ""}`}
              >
                Find a Ride
              </Link>
              <Link
                href="/offer"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive("/offer") ? "text-rose-600 bg-rose-50" : ""}`}
              >
                Offer a Ride
              </Link>
              <Link
                href="/recurring"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive("/recurring") ? "text-rose-600 bg-rose-50" : ""}`}
              >
                Recurring Rides
              </Link>
              <Link
                href="/pitstops"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive("/pitstops") ? "text-rose-600 bg-rose-50" : ""}`}
              >
                Pit Stops
              </Link>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center py-2 px-3">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <span className="font-medium">Sam Taylor</span>
              </div>
              <Link
                href="/profile"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive("/profile") ? "text-rose-600 bg-rose-50" : ""}`}
              >
                Profile
              </Link>
              <Link
                href="/my-rides"
                className={`block py-2 px-3 rounded-md hover:bg-gray-100 ${isActive("/my-rides") ? "text-rose-600 bg-rose-50" : ""}`}
              >
                My Rides
              </Link>
              <Link href="/logout" className="block py-2 px-3 rounded-md text-red-600 hover:bg-gray-100">
                Log out
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

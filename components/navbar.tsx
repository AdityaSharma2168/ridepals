"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, User, Car, Bell, Map, Calendar, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/ridepals-logo.png" alt="ridepals.ai" width={40} height={40} className="mr-2" />
              <span className="text-xl font-bold text-rose-600">ridepals.ai</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/find" active={pathname === "/find"}>
              Find a Ride
            </NavLink>
            <NavLink href="/offer" active={pathname === "/offer"}>
              Offer a Ride
            </NavLink>
            <NavLink href="/my-rides" active={pathname === "/my-rides"}>
              My Rides
            </NavLink>
            <NavLink href="/pitstops" active={pathname === "/pitstops"}>
              Pit Stops
            </NavLink>
            <NavLink href="/recurring" active={pathname === "/recurring"}>
              Recurring
            </NavLink>
            <NavLink href="/auth/test" active={pathname === "/auth/test"}>
              Auth Test
            </NavLink>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center">
            {user ? (
              <UserDropdownMenu user={user} signOut={signOut} />
            ) : (
              <Link href="/auth/login">
                <Button size="sm" variant="outline" className="mr-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <MobileNavLink href="/find" active={pathname === "/find"}>
              Find a Ride
            </MobileNavLink>
            <MobileNavLink href="/offer" active={pathname === "/offer"}>
              Offer a Ride
            </MobileNavLink>
            <MobileNavLink href="/my-rides" active={pathname === "/my-rides"}>
              My Rides
            </MobileNavLink>
            <MobileNavLink href="/pitstops" active={pathname === "/pitstops"}>
              Pit Stops
            </MobileNavLink>
            <MobileNavLink href="/recurring" active={pathname === "/recurring"}>
              Recurring
            </MobileNavLink>
            <MobileNavLink href="/auth/test" active={pathname === "/auth/test"}>
              Auth Test
            </MobileNavLink>

            {user ? (
              <div className="py-2">
                <div className="flex items-center py-2 px-4">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="border-t"></div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center py-2 px-4 w-full text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="py-2 px-4">
                <Link href="/auth/login">
                  <Button size="sm" className="w-full mb-2">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// User Dropdown Menu Component
function UserDropdownMenu({ user, signOut }: { user: any; signOut: () => Promise<void> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full hover:bg-gray-100 p-1 transition-colors duration-200">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
            <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</p>
            <p className="text-xs font-normal text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:bg-red-50 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Navigation Link Component
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active ? "text-rose-600 bg-rose-50" : "text-gray-700 hover:text-rose-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  )
}

// Mobile Navigation Link Component
function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block py-2 px-4 rounded-md text-base font-medium ${
        active ? "text-rose-600 bg-rose-50" : "text-gray-700 hover:text-rose-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  )
}

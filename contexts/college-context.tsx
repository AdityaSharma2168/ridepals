"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

export type College = {
  id: string
  name: string
  location: string
  abbreviation: string
  latitude: number
  longitude: number
  zoom: number
}

export const colleges: College[] = [
  {
    id: "stanford",
    name: "Stanford University",
    location: "Stanford",
    abbreviation: "Stanford",
    latitude: 37.4275,
    longitude: -122.1697,
    zoom: 14,
  },
  {
    id: "berkeley",
    name: "University of California, Berkeley",
    location: "Berkeley",
    abbreviation: "UC Berkeley",
    latitude: 37.8719,
    longitude: -122.2585,
    zoom: 14,
  },
  {
    id: "sfsu",
    name: "San Francisco State University",
    location: "San Francisco",
    abbreviation: "SFSU",
    latitude: 37.7241,
    longitude: -122.4799,
    zoom: 14,
  },
  {
    id: "sjsu",
    name: "San Jose State University",
    location: "San Jose",
    abbreviation: "SJSU",
    latitude: 37.3352,
    longitude: -121.8811,
    zoom: 14,
  },
  {
    id: "usfca",
    name: "University of San Francisco",
    location: "San Francisco",
    abbreviation: "USF",
    latitude: 37.7767,
    longitude: -122.4506,
    zoom: 14,
  },
  {
    id: "scu",
    name: "Santa Clara University",
    location: "Santa Clara",
    abbreviation: "SCU",
    latitude: 37.3496,
    longitude: -121.939,
    zoom: 14,
  },
  {
    id: "csueb",
    name: "California State University, East Bay",
    location: "Hayward",
    abbreviation: "CSUEB",
    latitude: 37.6575,
    longitude: -122.0567,
    zoom: 14,
  },
  {
    id: "mills",
    name: "Mills College",
    location: "Oakland",
    abbreviation: "Mills",
    latitude: 37.7802,
    longitude: -122.1831,
    zoom: 14,
  },
]

type CollegeContextType = {
  selectedCollege: College
  setSelectedCollege: (college: College) => void
  nearbyColleges: College[]
}

const defaultCollege = colleges[0]

const CollegeContext = createContext<CollegeContextType>({
  selectedCollege: defaultCollege,
  setSelectedCollege: () => {},
  nearbyColleges: [],
})

export const useCollege = () => useContext(CollegeContext)

export const CollegeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCollege, setSelectedCollege] = useState<College>(defaultCollege)
  const [nearbyColleges, setNearbyColleges] = useState<College[]>([])

  // Calculate nearby colleges whenever selected college changes
  useEffect(() => {
    // Simple distance calculation using latitude and longitude
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371 // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1)
      const dLon = deg2rad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c // Distance in km
      return d
    }

    const deg2rad = (deg: number) => {
      return deg * (Math.PI / 180)
    }

    // Find colleges within 50km of the selected college
    const nearby = colleges
      .filter((college) => college.id !== selectedCollege.id)
      .map((college) => ({
        ...college,
        distance: calculateDistance(
          selectedCollege.latitude,
          selectedCollege.longitude,
          college.latitude,
          college.longitude,
        ),
      }))
      .filter((college) => college.distance < 50)
      .sort((a, b) => a.distance - b.distance)

    setNearbyColleges(nearby)
  }, [selectedCollege])

  return (
    <CollegeContext.Provider value={{ selectedCollege, setSelectedCollege, nearbyColleges }}>
      {children}
    </CollegeContext.Provider>
  )
}

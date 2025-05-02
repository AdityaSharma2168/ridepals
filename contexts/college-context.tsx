"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

export interface College {
  id: string
  name: string
  abbreviation: string
  domain: string
  location?: string
  latitude?: number
  longitude?: number
}

interface CollegeContextType {
  colleges: College[]
  selectedCollege: College | null
  setSelectedCollege: (college: College | null) => void
  loadingColleges: boolean
  collegeByDomain: (domain: string) => College | undefined
  nearbyColleges: College[]
}

const CollegeContext = createContext<CollegeContextType>({
  colleges: [],
  selectedCollege: null,
  setSelectedCollege: () => {},
  loadingColleges: true,
  collegeByDomain: () => undefined,
  nearbyColleges: []
})

// Sample college data
const DEMO_COLLEGES: College[] = [
  {
    id: "stanford",
    name: "Stanford University",
    abbreviation: "Stanford",
    domain: "stanford.edu",
    location: "Palo Alto",
    latitude: 37.4275,
    longitude: -122.1697,
  },
  {
    id: "berkeley",
    name: "University of California, Berkeley",
    abbreviation: "UC Berkeley",
    domain: "berkeley.edu",
    location: "Berkeley",
    latitude: 37.8715,
    longitude: -122.2730,
  },
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    abbreviation: "MIT",
    domain: "mit.edu",
    location: "Cambridge",
    latitude: 42.3601,
    longitude: -71.0942,
  },
  {
    id: "harvard",
    name: "Harvard University",
    abbreviation: "Harvard",
    domain: "harvard.edu",
    location: "Cambridge",
    latitude: 42.3770,
    longitude: -71.1167,
  },
  {
    id: "ucla",
    name: "University of California, Los Angeles",
    abbreviation: "UCLA",
    domain: "ucla.edu",
    location: "Los Angeles",
    latitude: 34.0689,
    longitude: -118.4452,
  },
]

export function CollegeProvider({ children }: { children: ReactNode }) {
  const [colleges, setColleges] = useState<College[]>(DEMO_COLLEGES)
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
  const [loadingColleges, setLoadingColleges] = useState(true)
  const [nearbyColleges, setNearbyColleges] = useState<College[]>([])

  useEffect(() => {
    // In a real app, we would fetch colleges from the API
    // For now, we'll use the demo data
    setLoadingColleges(false)
    
    // Set some nearby colleges based on current selection
    if (selectedCollege) {
      const others = colleges.filter(c => c.id !== selectedCollege.id)
      setNearbyColleges(others.slice(0, 2))
    } else {
      setNearbyColleges([])
    }
  }, [selectedCollege, colleges])

  // Find a college by domain
  const collegeByDomain = (domain: string): College | undefined => {
    return colleges.find((college) => domain.endsWith(college.domain))
  }

  return (
    <CollegeContext.Provider
      value={{
        colleges,
        selectedCollege,
        setSelectedCollege,
        loadingColleges,
        collegeByDomain,
        nearbyColleges
      }}
    >
      {children}
    </CollegeContext.Provider>
  )
}

export const useCollege = () => useContext(CollegeContext)

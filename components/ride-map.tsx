"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Navigation, Coffee, Search } from "lucide-react"
import { useCollege } from "@/contexts/college-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const MarkerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

// Import useMap as a separate component
const MapEvents = dynamic<{ onMapClick: (lat: number, lng: number) => void }>(
  () => import('./map-events').then((mod) => mod.default),
  { ssr: false }
)

// Type for custom map markers
type MapMarker = {
  id: number
  type: "start" | "end" | "pitstop" | "college"
  lat: number
  lng: number
  label?: string
  collegeId?: string
  address?: string
}

// Type for pit stop data
type PitStop = {
  id: string
  name: string
  location: string
  discount: string
  coordinates: {
    lat: number
    lng: number
  }
}

type MapProps = {
  interactive?: boolean
  initialMarkers?: MapMarker[]
  onMarkerAdd?: (marker: MapMarker) => void
  onMarkerClick?: (marker: MapMarker) => void
  onDistanceUpdate?: (distanceMiles: number) => void
  onDurationUpdate?: (durationMinutes: number) => void
  startLocation?: string
  endLocation?: string
  pitStops?: PitStop[] // New prop for pit stops
}

// Function to calculate distance between two coordinates using the Haversine formula
const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in miles
  
  return distance;
}

// Calculate distance using markers' coordinates
const calculateDistanceInMiles = (markers: MapMarker[]): number => {
  // Filter out college markers and keep only route markers
  const routeMarkers = markers.filter(m => m.type !== "college")
  
  if (routeMarkers.length < 2) return 0
  
  // Sort markers in route order (start -> pitstops -> end)
  const sortedMarkers = [...routeMarkers].sort((a, b) => {
    if (a.type === "start") return -1;
    if (b.type === "start") return 1;
    if (a.type === "end") return 1;
    if (b.type === "end") return -1;
    return 0;
  });
  
  // Calculate route distance with routing factor
  let totalDistanceMiles = 0;
  
  for (let i = 1; i < sortedMarkers.length; i++) {
    const prevMarker = sortedMarkers[i-1];
    const currMarker = sortedMarkers[i];
    
    // Calculate direct distance
    const directDistance = calculateHaversineDistance(
      prevMarker.lat, 
      prevMarker.lng, 
      currMarker.lat, 
      currMarker.lng
    );
    
    // Apply a routing factor to simulate actual road routes
    // Roads are typically 20-30% longer than direct distances
    const routingFactor = 1.3;
    const routeDistance = directDistance * routingFactor;
    
    totalDistanceMiles += routeDistance;
  }
  
  // Round to 1 decimal place
  return Math.round(totalDistanceMiles * 10) / 10
}

// Function to estimate duration based on distance
const estimateDurationInMinutes = (distanceMiles: number): number => {
  // Assume average speed of 30 mph
  const hours = distanceMiles / 30
  const minutes = hours * 60
  
  // Add 2 minutes per pitstop + 5 minutes base time
  return Math.round(minutes + 5)
}

// Geocode address using a simple geocoding API
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    // For demo purposes we'll use a simple geocoding fallback map
    const geocodeMap: Record<string, {lat: number, lng: number}> = {
      "stanford": { lat: 37.4275, lng: -122.1697 },
      "palo alto": { lat: 37.4419, lng: -122.1430 },
      "menlo park": { lat: 37.4538, lng: -122.1822 },
      "mountain view": { lat: 37.3861, lng: -122.0839 },
      "san francisco": { lat: 37.7749, lng: -122.4194 },
      "berkeley": { lat: 37.8715, lng: -122.2730 },
      "san jose": { lat: 37.3382, lng: -121.8863 },
      "campus": { lat: 37.4275, lng: -122.1697 },
      "downtown": { lat: 37.4419, lng: -122.1430 },
    };
    
    // Try to find a match in our fallback data
    const lowerAddress = address.toLowerCase();
    for (const [key, coords] of Object.entries(geocodeMap)) {
      if (lowerAddress.includes(key)) {
        return coords;
      }
    }
    
    // If we can't find a match in our basic map, we could use a proper geocoding API here
    // For demo purposes, just return null
    return null;
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
};

// Generate directions URL to Google Maps
const generateDirectionsUrl = (markers: MapMarker[]): string => {
  // Filter and sort markers (start, pitstops, end)
  const routeMarkers = markers
    .filter(m => m.type !== "college")
    .sort((a, b) => {
      if (a.type === "start") return -1;
      if (b.type === "start") return 1;
      if (a.type === "end") return 1;
      if (b.type === "end") return -1;
      return 0;
    });
  
  if (routeMarkers.length < 2) {
    return "";
  }
  
  // Get start and end coordinates
  const start = routeMarkers[0];
  const end = routeMarkers[routeMarkers.length - 1];
  
  // Create Google Maps direction URL
  let url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}`;
  
  // Add waypoints if we have pitstops
  const waypoints = routeMarkers.filter(m => m.type === "pitstop");
  if (waypoints.length > 0) {
    const waypointCoords = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
    url += `&waypoints=${waypointCoords}`;
  }
  
  return url;
}

export default function RideMap({ 
  interactive = true, 
  initialMarkers, 
  onMarkerAdd, 
  onMarkerClick,
  onDistanceUpdate,
  onDurationUpdate,
  startLocation,
  endLocation,
  pitStops = [] // Default to empty array
}: MapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [markerType, setMarkerType] = useState<"start" | "end" | "pitstop">("start")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const { selectedCollege, nearbyColleges } = useCollege()
  const [mapReady, setMapReady] = useState(false)
  
  // Generate college-specific markers
  const generateCollegeMarkers = useCallback(() => {
    const baseMarkers = initialMarkers || []

    // Skip adding college markers if selectedCollege is null or coordinates are missing
    if (!selectedCollege || typeof selectedCollege.latitude !== 'number' || typeof selectedCollege.longitude !== 'number') {
      return [...baseMarkers];
    }

    // Add the selected college as a marker
    const collegeMarkers: MapMarker[] = [
      {
        id: 100,
        type: "college",
        lat: selectedCollege.latitude,
        lng: selectedCollege.longitude,
        label: selectedCollege.abbreviation,
        collegeId: selectedCollege.id,
      },
    ]

    // Add nearby colleges as markers (only those with valid coordinates)
    if (nearbyColleges) {
    nearbyColleges.forEach((college, index) => {
        if (typeof college.latitude === 'number' && typeof college.longitude === 'number') {
      collegeMarkers.push({
        id: 200 + index,
        type: "college",
            lat: college.latitude,
            lng: college.longitude,
        label: college.abbreviation,
        collegeId: college.id,
      })
        }
      })
    }

    return [...baseMarkers, ...collegeMarkers]
  }, [selectedCollege, nearbyColleges, initialMarkers]);

  // Update markers when selectedCollege changes
  useEffect(() => {
    setMarkers(generateCollegeMarkers());
  }, [generateCollegeMarkers]);

  // Calculate and update distance and duration whenever markers change
  useEffect(() => {
    const distance = calculateDistanceInMiles(markers);
    const duration = estimateDurationInMinutes(distance);
    
    // Notify parent component of updates
    if (onDistanceUpdate) onDistanceUpdate(distance);
    if (onDurationUpdate) onDurationUpdate(duration);
  }, [markers, onDistanceUpdate, onDurationUpdate]);

  // Add start and end locations if provided
  useEffect(() => {
    const addLocationMarker = async (location: string | undefined, type: "start" | "end") => {
      if (!location) return;
      
      // Only add if we don't already have this type of marker
      const existingMarker = markers.find(m => m.type === type);
      if (existingMarker) return;
      
      try {
        const result = await geocodeAddress(location);
        if (result) {
          // Add a new marker for the location
          const newMarker: MapMarker = {
            id: Date.now() + (type === "start" ? 1 : 2),
            type: type,
            lat: result.lat,
            lng: result.lng,
            label: location,
            address: location
          };
          
          setMarkers(prev => [...prev.filter(m => m.type !== type && m.type !== "college"), ...generateCollegeMarkers(), newMarker]);
          if (onMarkerAdd) onMarkerAdd(newMarker);
        }
      } catch (error) {
        console.error(`Error geocoding ${type} location:`, error);
      }
    };
    
    // Add markers for start and end locations if provided
    if (startLocation || endLocation) {
      // Reset any existing route markers
      setMarkers(markers.filter(m => m.type === "college"));
      
      // Add new markers
      if (startLocation) addLocationMarker(startLocation, "start");
      if (endLocation) addLocationMarker(endLocation, "end");
    }
  }, [startLocation, endLocation]);

  // Add pit stops to the map when they are selected
  useEffect(() => {
    if (!startLocation || !endLocation) return; // Skip if no start/end points defined
    
    if (pitStops && pitStops.length > 0) {
      // Create markers for each pit stop
      const pitStopMarkers = pitStops.map((stop, index) => ({
        id: Date.now() + 500 + index,
        type: "pitstop" as const,
        lat: stop.coordinates.lat,
        lng: stop.coordinates.lng,
        label: stop.name,
        address: stop.location
      }));
      
      // Add the new pit stop markers to the map, preserving start, end and college markers
      setMarkers(prev => {
        // Keep start, end, and college markers
        const existingMarkers = prev.filter(
          m => m.type === "start" || m.type === "end" || m.type === "college"
        );
        
        return [...existingMarkers, ...pitStopMarkers];
      });
      
      // Notify parent of marker additions
      pitStopMarkers.forEach(marker => {
        if (onMarkerAdd) onMarkerAdd(marker);
      });
    }
  }, [pitStops]);

  // Handle map click to add a marker
  const handleMapClick = (lat: number, lng: number) => {
    if (!interactive) return;
    
    // Add new marker
    const newMarker: MapMarker = {
      id: Date.now(),
      type: markerType,
      lat,
      lng,
      label: markerType === "start" ? "Start" : markerType === "end" ? "Destination" : "Pit Stop"
    };
    
    // Update markers (replace if start/end)
    setMarkers(prev => {
      if (markerType === "start" || markerType === "end") {
        return [...prev.filter(m => m.type !== markerType && m.type !== "college"), ...generateCollegeMarkers(), newMarker];
      }
      return [...prev.filter(m => m.type !== "college"), ...generateCollegeMarkers(), newMarker];
    });
    
    // Update UI after adding start
    if (markerType === "start") {
      setMarkerType("end");
    } else if (markerType === "end") {
      // After end is placed, switch to pitstop for any additional points
      setMarkerType("pitstop");
    }
    
    // Notify parent
    if (onMarkerAdd) onMarkerAdd(newMarker);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await geocodeAddress(searchQuery);
      if (result) {
        // Add a new marker for the search result
        const newMarker: MapMarker = {
          id: Date.now(),
          type: markerType,
          lat: result.lat,
          lng: result.lng,
          label: searchQuery,
          address: searchQuery
        };
        
        // Update markers (replace if start/end)
        setMarkers(prev => {
          if (markerType === "start" || markerType === "end") {
            return [...prev.filter(m => m.type !== markerType && m.type !== "college"), ...generateCollegeMarkers(), newMarker];
          }
          return [...prev.filter(m => m.type !== "college"), ...generateCollegeMarkers(), newMarker];
        });
        
        // Update UI after adding start
        if (markerType === "start") {
          setMarkerType("end");
        } else if (markerType === "end") {
          // After end is placed, switch to pitstop for any additional points
          setMarkerType("pitstop");
        }
        
        if (onMarkerAdd) onMarkerAdd(newMarker);
        
        // Clear search after adding
        setSearchQuery("");
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Error in geocoding:", error);
      alert("Could not find the location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteMarker = (id: number) => {
    const updatedMarkers = markers.filter(marker => marker.id !== id);
    setMarkers(updatedMarkers);
    if (selectedMarker?.id === id) {
      setSelectedMarker(null);
    }
  };

  // Generate navigation link
  const directionsUrl = generateDirectionsUrl(markers);
  
  // Create marker icon functions
  const getLeafletIcon = (type: "start" | "end" | "pitstop" | "college", label?: string): any => {
    // We need to check if window is defined since this component is rendered on the server
    if (typeof window === 'undefined') return null;
    
    // Import Leaflet dynamically since it's only available on the client
    const L = require('leaflet');
    
    // Choose icon color based on marker type
    let iconColor = '#3b82f6'; // Default blue
    if (type === 'start') iconColor = '#ef4444'; // Red
    if (type === 'pitstop') iconColor = '#f59e0b'; // Amber
    if (type === 'college') iconColor = '#6366f1'; // Indigo
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">${type === 'college' && label ? label : ''}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };
  
  // Only render map component on client side
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // CSS for Leaflet map
  useEffect(() => {
    // Add Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg relative flex flex-col">
      {interactive && (
        <div className="p-3 border-b border-gray-200 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              className={`p-2 flex-1 ${markerType === "start" ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setMarkerType("start")}
            title="Add start point"
          >
              <Navigation size={16} className="mr-2" />
              Start
            </Button>
            <Button
              className={`p-2 flex-1 ${markerType === "pitstop" ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setMarkerType("pitstop")}
            title="Add pit stop"
          >
              <Coffee size={16} className="mr-2" />
              Pit Stop
            </Button>
            <Button
              className={`p-2 flex-1 ${markerType === "end" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setMarkerType("end")}
            title="Add destination"
          >
              <MapPin size={16} className="mr-2" />
              End
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Search for a location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-grow"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="shrink-0"
            >
              {isSearching ? "..." : <Search size={16} />}
            </Button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => {
                // Reset the map - keep only college markers
                setMarkers(generateCollegeMarkers());
                setMarkerType("start");
                setSelectedMarker(null);
                if (onDistanceUpdate) onDistanceUpdate(0);
                if (onDurationUpdate) onDurationUpdate(0);
              }}
              variant="outline"
              className="w-full"
            >
              Reset Map
            </Button>
          </div>
          
          {directionsUrl && (
            <div className="flex mt-2">
              <a 
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Navigation size={16} className="mr-2" />
                  Get Directions
                </Button>
              </a>
            </div>
          )}
          
          <div className="text-xs text-center text-gray-500 mt-1">
            Click directly on the map to place {markerType === "start" ? "start" : markerType === "end" ? "end" : "pit stop"} point
          </div>
        </div>
      )}

      <div className="flex-grow relative min-h-[300px]">
        {errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-red-500 mb-2">{errorMessage}</p>
              <p>Please check your internet connection and try again.</p>
            </div>
          </div>
        )}
        
        {/* Only render the map on client-side */}
        {isMounted ? (
          <MapContainer 
            center={selectedCollege && typeof selectedCollege.latitude === 'number' && typeof selectedCollege.longitude === 'number' 
              ? [selectedCollege.latitude, selectedCollege.longitude] 
              : [37.7749, -122.4194]} // Default to San Francisco coordinates
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {interactive && (
              <MapEvents onMapClick={handleMapClick} />
            )}
            
            {markers.map(marker => {
              if (typeof window === 'undefined') return null;
              const L = require('leaflet');
              
              return (
                <MarkerComponent
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={getLeafletIcon(marker.type, marker.label)}
                  eventHandlers={{
                    click: () => {
                      setSelectedMarker(marker);
                      if (onMarkerClick) onMarkerClick(marker);
                    }
                  }}
                >
                  <Popup>
                    <div>
                      <p className="font-medium">{marker.label || marker.type}</p>
                      {marker.address && (
                        <p className="text-gray-500 text-sm">{marker.address}</p>
                      )}
                      {marker.type !== 'college' && interactive && (
                        <button 
                          className="text-red-500 hover:text-red-700 text-sm mt-1"
                          onClick={() => handleDeleteMarker(marker.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </Popup>
                </MarkerComponent>
              );
            })}
            
            {/* Draw route line */}
            {markers.filter(m => m.type !== "college").length >= 2 && (
              <Polyline
                positions={markers
                  .filter(m => m.type !== "college")
                  .sort((a, b) => {
                    if (a.type === "start") return -1;
                    if (b.type === "start") return 1;
                    if (a.type === "end") return 1;
                    if (b.type === "end") return -1;
                    return 0;
                  })
                  .map(m => [m.lat, m.lng])
                }
                color="#3b82f6"
                weight={4}
                opacity={0.7}
              />
            )}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p>Loading map...</p>
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-sm text-xs z-[1000]">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-rose-500 mr-1"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
          <span>Pit Stop</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span>Destination</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
            <span>Colleges</span>
          </div>
      </div>

        {selectedMarker && interactive && (
          <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow-sm text-xs z-[1000]">
          <p className="font-medium">{selectedMarker.label || selectedMarker.type}</p>
            {selectedMarker.address && (
              <p className="text-gray-500">{selectedMarker.address}</p>
            )}
            {selectedMarker.type !== 'college' && (
              <div className="mt-1">
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteMarker(selectedMarker.id)}
                >
                  Delete
                </button>
              </div>
            )}
        </div>
      )}
      </div>
    </div>
  )
}


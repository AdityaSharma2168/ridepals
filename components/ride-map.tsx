"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Coffee } from "lucide-react"
import { useCollege } from "@/contexts/college-context"

type Marker = {
  id: number
  type: "start" | "end" | "pitstop" | "college"
  x: number
  y: number
  label?: string
  collegeId?: string
}

type MapProps = {
  interactive?: boolean
  initialMarkers?: Marker[]
  onMarkerAdd?: (marker: Marker) => void
  onMarkerClick?: (marker: Marker) => void
}

export default function RideMap({ interactive = true, initialMarkers, onMarkerAdd, onMarkerClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const { selectedCollege, nearbyColleges } = useCollege()

  // Generate college-specific markers based on the selected college
  const generateCollegeMarkers = () => {
    // Convert GPS coordinates to relative canvas positions
    // This is a simplified approach - in a real app, you'd use a mapping library
    const baseMarkers = initialMarkers || []

    // Add the selected college as a marker
    const collegeMarkers: Marker[] = [
      {
        id: 100,
        type: "college",
        x: 200, // Center of canvas
        y: 200, // Center of canvas
        label: selectedCollege.abbreviation,
        collegeId: selectedCollege.id,
      },
    ]

    // Add nearby colleges as markers
    nearbyColleges.forEach((college, index) => {
      // Position nearby colleges around the selected college
      // This is just for demonstration - real app would use actual coordinates
      const angle = (index * Math.PI * 2) / nearbyColleges.length
      const distance = 150 // Distance from center

      collegeMarkers.push({
        id: 200 + index,
        type: "college",
        x: 200 + Math.cos(angle) * distance,
        y: 200 + Math.sin(angle) * distance,
        label: college.abbreviation,
        collegeId: college.id,
      })
    })

    // Generate some local landmarks based on selected college
    const localMarkers: Marker[] = [
      {
        id: 1,
        type: "start",
        x: 150,
        y: 180,
        label: `${selectedCollege.abbreviation} Dorms`,
      },
      {
        id: 2,
        type: "pitstop",
        x: 220,
        y: 150,
        label: `${selectedCollege.location} Coffee`,
      },
      {
        id: 3,
        type: "end",
        x: 280,
        y: 220,
        label: `${selectedCollege.location} Downtown`,
      },
    ]

    return [...baseMarkers, ...collegeMarkers, ...localMarkers]
  }

  const [markers, setMarkers] = useState<Marker[]>(generateCollegeMarkers())
  const [markerType, setMarkerType] = useState<"start" | "end" | "pitstop">("pitstop")

  // Update markers when college changes
  useEffect(() => {
    setMarkers(generateCollegeMarkers())
  }, [selectedCollege, nearbyColleges])

  const drawMap = () => {
    if (!mapRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw a placeholder map
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#f8fafc")
    gradient.addColorStop(1, "#f1f5f9")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw main roads
    ctx.strokeStyle = "#cbd5e1"
    ctx.lineWidth = 12

    // Horizontal main roads
    for (let y = 100; y < canvas.height; y += 200) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Vertical main roads
    for (let x = 100; x < canvas.width; x += 200) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw secondary roads
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 8

    // Horizontal secondary roads
    for (let y = 50; y < canvas.height; y += 100) {
      if (y % 200 !== 0) {
        // Skip main roads
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Vertical secondary roads
    for (let x = 50; x < canvas.width; x += 100) {
      if (x % 200 !== 0) {
        // Skip main roads
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
    }

    // Draw college name as a watermark
    ctx.font = "bold 48px sans-serif"
    ctx.fillStyle = "rgba(239, 68, 68, 0.05)" // Very light rose color
    ctx.textAlign = "center"
    ctx.fillText(selectedCollege.abbreviation, canvas.width / 2, canvas.height / 2)

    // Sort markers to ensure start and end are first and last
    const sortedMarkers = [...markers].sort((a, b) => {
      if (a.type === "start") return -1
      if (b.type === "start") return 1
      if (a.type === "end") return 1
      if (b.type === "end") return -1
      return 0
    })

    // Draw route if we have at least 2 markers
    if (sortedMarkers.filter((m) => m.type !== "college").length >= 2) {
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 4
      ctx.beginPath()

      // Filter out college markers for the route
      const routeMarkers = sortedMarkers.filter((m) => m.type !== "college")

      // Start at the first marker
      ctx.moveTo(routeMarkers[0].x, routeMarkers[0].y)

      // Connect all markers in order
      for (let i = 1; i < routeMarkers.length; i++) {
        ctx.lineTo(routeMarkers[i].x, routeMarkers[i].y)
      }

      ctx.stroke()
    }

    // Draw markers
    sortedMarkers.forEach((marker) => {
      const isSelected = selectedMarker?.id === marker.id
      const scale = isSelected ? 1.2 : 1

      // Draw marker shadow
      ctx.beginPath()
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.arc(marker.x, marker.y + 2, 10 * scale, 0, Math.PI * 2)
      ctx.fill()

      // Draw marker based on type
      if (marker.type === "start") {
        ctx.fillStyle = "#ef4444"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 10 * scale, 0, Math.PI * 2)
        ctx.fill()

        // Draw inner circle
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 5 * scale, 0, Math.PI * 2)
        ctx.fill()
      } else if (marker.type === "end") {
        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 10 * scale, 0, Math.PI * 2)
        ctx.fill()

        // Draw inner circle
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 5 * scale, 0, Math.PI * 2)
        ctx.fill()
      } else if (marker.type === "pitstop") {
        ctx.fillStyle = "#f59e0b"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 8 * scale, 0, Math.PI * 2)
        ctx.fill()

        // Draw inner circle
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 4 * scale, 0, Math.PI * 2)
        ctx.fill()
      } else if (marker.type === "college") {
        // Draw college marker
        ctx.fillStyle = marker.collegeId === selectedCollege.id ? "#ef4444" : "#6366f1"
        ctx.beginPath()
        ctx.arc(marker.x, marker.y, 12 * scale, 0, Math.PI * 2)
        ctx.fill()

        // Draw college icon
        ctx.fillStyle = "#ffffff"
        ctx.font = `${9 * scale}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("U", marker.x, marker.y)
      }

      // Draw label if provided
      if (marker.label) {
        ctx.font = `${isSelected ? "bold " : ""}12px sans-serif`
        ctx.fillStyle = "#1e293b"
        ctx.textAlign = "center"
        ctx.fillText(marker.label, marker.x, marker.y - 15)
      }
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = mapRef.current.clientWidth
      canvas.height = mapRef.current.clientHeight
      mapRef.current.appendChild(canvas)
      canvasRef.current = canvas
    }

    // Draw the map
    drawMap()

    // Handle window resize
    const handleResize = () => {
      if (mapRef.current && canvasRef.current) {
        canvasRef.current.width = mapRef.current.clientWidth
        canvasRef.current.height = mapRef.current.clientHeight
        drawMap()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [markers, selectedMarker, selectedCollege])

  const handleMapClick = (e: React.MouseEvent) => {
    if (!interactive) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on an existing marker
    const clickedMarker = markers.find((marker) => {
      const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2))
      return distance < 15 // 15px radius for click detection
    })

    if (clickedMarker) {
      setSelectedMarker(clickedMarker)
      if (onMarkerClick) onMarkerClick(clickedMarker)
    } else {
      // Add new marker
      const newMarker = {
        id: Date.now(),
        type: markerType,
        x,
        y,
        label: markerType === "start" ? "Start" : markerType === "end" ? "Destination" : "Pit Stop",
      }

      const updatedMarkers = [...markers, newMarker]
      setMarkers(updatedMarkers)
      setSelectedMarker(newMarker)

      if (onMarkerAdd) onMarkerAdd(newMarker)
    }
  }

  const handleMarkerDragStart = (e: React.MouseEvent, marker: Marker) => {
    if (!interactive) return

    e.stopPropagation()
    setIsDragging(true)
    setSelectedMarker(marker)
  }

  const handleMarkerDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedMarker || !interactive) return

    const rect = mapRef.current!.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

    const updatedMarkers = markers.map((marker) => (marker.id === selectedMarker.id ? { ...marker, x, y } : marker))

    setMarkers(updatedMarkers)
  }

  const handleMarkerDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-gray-100 rounded-lg relative cursor-crosshair"
      onClick={handleMapClick}
      onMouseMove={handleMarkerDrag}
      onMouseUp={handleMarkerDragEnd}
      onMouseLeave={handleMarkerDragEnd}
    >
      {interactive && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded-md shadow-sm z-10 flex gap-2">
          <button
            className={`p-2 rounded-md ${markerType === "start" ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={(e) => {
              e.stopPropagation()
              setMarkerType("start")
            }}
            title="Add start point"
          >
            <Navigation size={16} />
          </button>
          <button
            className={`p-2 rounded-md ${markerType === "pitstop" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={(e) => {
              e.stopPropagation()
              setMarkerType("pitstop")
            }}
            title="Add pit stop"
          >
            <Coffee size={16} />
          </button>
          <button
            className={`p-2 rounded-md ${markerType === "end" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={(e) => {
              e.stopPropagation()
              setMarkerType("end")
            }}
            title="Add destination"
          >
            <MapPin size={16} />
          </button>
        </div>
      )}

      <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-sm text-xs z-10">
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
          <span>Other Colleges</span>
        </div>
      </div>

      {selectedMarker && (
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow-sm text-xs z-10">
          <p className="font-medium">{selectedMarker.label || selectedMarker.type}</p>
          <p className="text-gray-500">Click and drag to move</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

type MapEventsProps = {
  onMapClick: (lat: number, lng: number) => void;
};

// Component to handle map clicks and update the view
export default function MapEvents({ onMapClick }: MapEventsProps) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  return null;
} 
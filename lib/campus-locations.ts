export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'building' | 'landmark' | 'parking' | 'other';
}

// Sample campus locations - you can modify these based on your needs
const campusLocations: Location[] = [
  {
    id: '1',
    name: 'Main Library',
    latitude: 37.7749,
    longitude: -122.4194,
    type: 'building'
  },
  {
    id: '2',
    name: 'Student Center',
    latitude: 37.7750,
    longitude: -122.4195,
    type: 'building'
  },
  {
    id: '3',
    name: 'Science Building',
    latitude: 37.7751,
    longitude: -122.4196,
    type: 'building'
  },
  {
    id: '4',
    name: 'Central Park',
    latitude: 37.7752,
    longitude: -122.4197,
    type: 'parking'
  }
];

export function getPopularStartingPoints(): Location[] {
  // Return the most popular starting points
  return campusLocations.slice(0, 3);
}

export function findNearbyLocations(
  latitude: number,
  longitude: number,
  radiusInKm: number = 1
): Location[] {
  // Simple implementation - you might want to use a more sophisticated algorithm
  return campusLocations.filter(location => {
    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );
    return distance <= radiusInKm;
  });
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 
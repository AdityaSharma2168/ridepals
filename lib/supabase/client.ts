import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://anxazfrjckjyetuzfqvb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueGF6ZnJqY2tqeWV0dXpmcXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTAyMjIsImV4cCI6MjA2NDI2NjIyMn0.RFVKRWGNDisenGi9Y6bVVTcMPkub2FoN6RskkgSNfls'

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Add geocoding function near the top of the file
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    // Using OpenStreetMap Nominatim (free geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Database Types (updated to match actual schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string
          college_email: string | null
          is_driver: boolean
          created_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          email: string
          college_email?: string | null
          is_driver?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          college_email?: string | null
          is_driver?: boolean
          created_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          created_at: string
          driver_id: string
          origin: string
          destination: string
          origin_coords: any // PostGIS geometry
          destination_coords: any // PostGIS geometry
          departure_time: string
          price_per_seat: number
          total_seats: number
          available_seats: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          driver_id: string
          origin: string
          destination: string
          origin_coords?: any
          destination_coords?: any
          departure_time: string
          price_per_seat: number
          total_seats: number
          available_seats: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          driver_id?: string
          origin?: string
          destination?: string
          origin_coords?: any
          destination_coords?: any
          departure_time?: string
          price_per_seat?: number
          total_seats?: number
          available_seats?: number
          notes?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          ride_id: string
          rider_id: string
          seats_booked: number
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          ride_id: string
          rider_id: string
          seats_booked: number
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          ride_id?: string
          rider_id?: string
          seats_booked?: number
          status?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          domain: string
          location: any // PostGIS point
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          location: any
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          location?: any
          created_at?: string
        }
      }
    }
  }
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
  }
}

// Database helper functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }
  
  return data
}

// Function to check current user's driver status
export const checkUserDriverStatus = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ Not authenticated:', userError)
      return { isDriver: false, profile: null, error: 'Not authenticated' }
    }

    console.log('🔍 Checking profile for user ID:', user.id)

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Error fetching user profile:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        rawError: error
      })
      
      // If user doesn't exist, try to create them
      if (error.code === 'PGRST116') {
        console.log('👤 User profile not found, creating...')
        return await createUserProfile(user)
      }
      
      return { isDriver: false, profile: null, error: error.message || 'Database error' }
    }

    console.log('👤 Current user profile:', profile)
    return { isDriver: profile?.is_driver || false, profile, error: null }
  } catch (err: any) {
    console.error('💥 Unexpected error in checkUserDriverStatus:', err)
    return { isDriver: false, profile: null, error: err.message }
  }
}

// Function to create user profile
export const createUserProfile = async (user: any) => {
  try {
    console.log('🏗️ Creating user profile for:', user.email)
    
    // Only use columns that exist in the database
    const newProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      college_email: user.email || '',
      is_driver: false,
      // Removed is_verified since it doesn't exist in the schema
    }

    console.log('📝 Profile data to insert:', newProfile)

    const { data, error } = await supabase
      .from('users')
      .insert(newProfile)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating user profile:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        rawError: error
      })
      return { isDriver: false, profile: null, error: error.message || 'Failed to create profile' }
    }

    console.log('✅ User profile created:', data)
    return { isDriver: false, profile: data, error: null }
  } catch (err: any) {
    console.error('💥 Unexpected error creating profile:', err)
    return { isDriver: false, profile: null, error: err.message }
  }
}

// Debug function to make current user a driver
export const makeCurrentUserDriver = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ Not authenticated:', userError)
      return false
    }

    console.log('🔧 Making user a driver:', user.id)

    // First check if user profile exists
    const statusCheck = await checkUserDriverStatus()
    if (statusCheck.error && !statusCheck.profile) {
      console.error('❌ Cannot make user driver - profile issues:', statusCheck.error)
      return false
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_driver: true })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error making user driver:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        rawError: error
      })
      return false
    }

    console.log('✅ User is now a driver:', data)
    return true
  } catch (err: any) {
    console.error('💥 Unexpected error in makeCurrentUserDriver:', err)
    return false
  }
}

// Ride functions
export const createRide = async (rideData: any) => {
  try {
    console.log('🔄 Starting createRide function...')
    console.log('📋 Input data:', rideData)
    
    // Get current user first
    console.log('👤 Getting current user...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ Authentication error:', userError)
      return { error: 'User not authenticated', data: null }
    }

    console.log('✅ User authenticated:', user.email)

    // Check if user profile exists
    console.log('👤 Checking user profile...')
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('❌ User profile not found:', profileError)
      return { error: 'User profile not found. Please complete your profile first.', data: null }
    }

    console.log('✅ User profile found:', userProfile.email)

    // Check if user is a driver
    if (!userProfile.is_driver) {
      console.error('❌ User is not a driver')
      return { error: 'You must be registered as a driver to offer rides.', data: null }
    }

    console.log('✅ User is a driver, creating ride...')
    
    // Geocode the origin and destination addresses
    console.log('🌍 Starting geocoding for origin:', rideData.origin)
    const originCoords = await geocodeAddress(rideData.origin);
    console.log('🌍 Origin geocoding result:', originCoords)
    
    console.log('🌍 Starting geocoding for destination:', rideData.destination)
    const destCoords = await geocodeAddress(rideData.destination);
    console.log('🌍 Destination geocoding result:', destCoords)
    
    console.log('📍 Final coordinates prepared:', { 
      origin: originCoords, 
      destination: destCoords
    });
    
    // Transform the ride data to match the database schema
    const dbRideData = {
      driver_id: rideData.driver_id,
      origin: rideData.origin,
      destination: rideData.destination,
      departure_time: rideData.departure_time,
      price_per_seat: rideData.price_per_seat,
      total_seats: rideData.available_seats, // Map available_seats to total_seats
      available_seats: rideData.available_seats,
      // Skip coordinates for now - we'll add PostGIS support later
      origin_coords: null,
      destination_coords: null,
      notes: null,
      status: 'active', // Ensure ride shows up in search results
    }
    
    console.log('📝 Transformed ride data for DB:', dbRideData)

    // Create the ride
    console.log('💾 Attempting database insert...')
    const { data, error } = await supabase
      .from('rides')
      .insert(dbRideData)
      .select()
      .single()
    
    console.log('💾 Database insert completed')
    
    if (error) {
      console.error('❌ Database error creating ride:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { error: error.message || 'Failed to create ride', data: null }
    }
    
    console.log('✅ Ride created successfully:', data)
    return { error: null, data }
  } catch (error: any) {
    console.error('💥 Unexpected error in createRide:', error)
    return { error: error.message || 'Unexpected error occurred', data: null }
  }
}

export const searchRides = async (filters: any) => {
  let query = supabase
    .from('rides')
    .select(`
      *,
      driver:users!rides_driver_id_fkey(*)
    `)
    .eq('status', 'active')
  
  // Text-based location search
  if (filters.origin) {
    query = query.ilike('origin', `%${filters.origin}%`)
  }
  
  if (filters.destination) {
    query = query.ilike('destination', `%${filters.destination}%`)
  }
  
  // Date/time filters
  if (filters.date) {
    const startOfDay = new Date(filters.date);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
  }
  
  // Minimum seats available
  if (filters.minSeats) {
    query = query.gte('available_seats', filters.minSeats)
  }
  
  // Price range
  if (filters.maxPrice) {
    query = query.lte('price_per_seat', filters.maxPrice)
  }
  
  // Order by departure time
  query = query.order('departure_time', { ascending: true })
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error searching rides:', error)
    return []
  }
  
  return data || []
}

// Enhanced search with PostGIS distance filtering
export const searchRidesWithDistance = async (filters: {
  userLat?: number,
  userLng?: number,
  maxDistanceKm?: number,
  origin?: string,
  destination?: string,
  date?: string,
  minSeats?: number,
  maxPrice?: number
}) => {
  try {
    let query = supabase
      .from('rides')
      .select(`
        *,
        driver:users!rides_driver_id_fkey(*)
      `)
      .eq('status', 'active')
    
    // Apply text-based filters for now (PostGIS distance search can be added later)
    if (filters.origin) {
      query = query.ilike('origin', `%${filters.origin}%`)
    }
    
    if (filters.destination) {
      query = query.ilike('destination', `%${filters.destination}%`)
    }
    
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('departure_time', startOfDay.toISOString())
        .lte('departure_time', endOfDay.toISOString())
    }
    
    if (filters.minSeats) {
      query = query.gte('available_seats', filters.minSeats)
    }
    
    if (filters.maxPrice) {
      query = query.lte('price_per_seat', filters.maxPrice)
    }
    
    query = query.order('departure_time', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error searching rides with distance:', error)
      // Fall back to basic search
      return await searchRides({
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        minSeats: filters.minSeats,
        maxPrice: filters.maxPrice
      })
    }
    
    return data || []
  } catch (error) {
    console.error('Unexpected error in distance search:', error)
    // Fall back to basic search on any error
    return await searchRides({
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date,
      minSeats: filters.minSeats,
      maxPrice: filters.maxPrice
    })
  }
}
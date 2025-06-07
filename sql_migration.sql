-- PostGIS Setup for RidePals - Run this in your Supabase SQL Editor
-- This sets up proper PostGIS geometry columns for storing GeoJSON Point objects

-- 1. Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Check current table structure first
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rides' 
ORDER BY ordinal_position;

-- 3. Add status column if it doesn't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rides' AND column_name = 'status') THEN
        ALTER TABLE rides ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added status column to rides table';
    ELSE
        RAISE NOTICE 'Status column already exists';
    END IF;
END $$;

-- 4. Make coordinates nullable and ensure proper PostGIS geometry types
-- Drop NOT NULL constraints if they exist
DO $$ 
BEGIN
    -- Try to drop NOT NULL constraints
    BEGIN
        ALTER TABLE rides ALTER COLUMN origin_coords DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL constraint from origin_coords';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'origin_coords constraint already removed or does not exist: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE rides ALTER COLUMN destination_coords DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL constraint from destination_coords';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'destination_coords constraint already removed or does not exist: %', SQLERRM;
    END;
END $$;

-- 5. Ensure columns are proper PostGIS geometry types (POINT with SRID 4326 for WGS84)
DO $$ 
BEGIN
    -- Try to alter column types, catch and ignore if already correct
    BEGIN
        ALTER TABLE rides ALTER COLUMN origin_coords TYPE geometry(POINT, 4326);
        RAISE NOTICE 'Set origin_coords to proper PostGIS geometry type';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'origin_coords already proper geometry type or conversion failed: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE rides ALTER COLUMN destination_coords TYPE geometry(POINT, 4326);
        RAISE NOTICE 'Set destination_coords to proper PostGIS geometry type';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'destination_coords already proper geometry type or conversion failed: %', SQLERRM;
    END;
END $$;

-- 6. Create spatial indexes for better performance (GIST indexes for geometry columns)
CREATE INDEX IF NOT EXISTS rides_origin_coords_gist_idx 
ON rides USING GIST (origin_coords);

CREATE INDEX IF NOT EXISTS rides_destination_coords_gist_idx 
ON rides USING GIST (destination_coords);

-- 7. Create other useful indexes
CREATE INDEX IF NOT EXISTS rides_departure_time_idx 
ON rides (departure_time);

CREATE INDEX IF NOT EXISTS rides_status_idx 
ON rides (status);

CREATE INDEX IF NOT EXISTS rides_driver_id_idx 
ON rides (driver_id);

-- 8. Verify the setup
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'rides' 
AND column_name IN ('origin_coords', 'destination_coords', 'status')
ORDER BY column_name;

-- 9. Test PostGIS functionality
SELECT PostGIS_Version() as postgis_version;

-- 10. Show current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rides' 
ORDER BY ordinal_position;

-- 11. Test inserting a sample GeoJSON point (remove this after testing)
-- This is just to verify the setup works - you can delete this after running
INSERT INTO rides (
    driver_id, 
    origin, 
    destination, 
    origin_coords, 
    destination_coords,
    departure_time,
    price_per_seat,
    total_seats,
    available_seats,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- placeholder UUID
    'Test Origin',
    'Test Destination', 
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[-122.4194,37.7749]}'), -- San Francisco
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[-122.0851,37.4220]}'), -- Palo Alto
    NOW() + INTERVAL '1 day',
    15.00,
    4,
    4,
    'active'
) ON CONFLICT DO NOTHING; -- Don't insert if it would cause a conflict

-- 12. Test spatial query functionality
SELECT 
    origin,
    destination,
    ST_AsGeoJSON(origin_coords) as origin_geojson,
    ST_AsGeoJSON(destination_coords) as dest_geojson,
    ST_Distance(origin_coords, destination_coords) as distance_degrees
FROM rides 
WHERE origin_coords IS NOT NULL 
AND destination_coords IS NOT NULL
LIMIT 1;

-- 13. Clean up test data (run this after verifying everything works)
-- DELETE FROM rides WHERE driver_id = '00000000-0000-0000-0000-000000000000'; 
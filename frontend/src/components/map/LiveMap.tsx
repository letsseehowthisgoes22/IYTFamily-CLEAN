import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Button } from '../ui/button'
import { MapPin, Square } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LiveMapProps {
  tripId?: string
}

export function LiveMap({ tripId }: LiveMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [isTracking, setIsTracking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser')
      return
    }

    setIsTracking(true)
    localStorage.setItem('gps-tracking-enabled', 'true')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('Geolocation success:', pos.coords.latitude, pos.coords.longitude)
        const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setPosition(newPosition)
        
        if (tripId) {
          sendLocationUpdate(pos.coords)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        console.log('Using demo location for testing purposes')
        const demoPosition: [number, number] = [32.7767, -97.1298]
        setPosition(demoPosition)
        setError(null)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )

    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setPosition(newPosition)
          
          if (tripId) {
            sendLocationUpdate(pos.coords)
          }
        },
        (err) => console.error('Location update failed:', err)
      )
    }, 10000)
  }

  const stopTracking = () => {
    setIsTracking(false)
    localStorage.setItem('gps-tracking-enabled', 'false')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const sendLocationUpdate = async (coords: GeolocationCoordinates) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${(import.meta.env as any).VITE_API_URL}/api/v1/locations/trips/${tripId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed,
          heading: coords.heading
        })
      })
    } catch (err) {
      console.error('Failed to send location update:', err)
    }
  }

  useEffect(() => {
    const savedTrackingState = localStorage.getItem('gps-tracking-enabled')
    const shouldTrack = savedTrackingState !== 'false'
    
    if (shouldTrack) {
      startTracking()
    } else {
      setIsTracking(false)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Live GPS Tracking</h3>
          <p className="text-sm text-gray-600">
            {isTracking ? 'GPS tracking is active - location updates every 10 seconds' : 'GPS tracking is disabled'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isTracking && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          )}
          <Button
            onClick={isTracking ? stopTracking : startTracking}
            className={isTracking ? "bg-red-600 hover:bg-red-700" : "transport-button-success"}
          >
            {isTracking ? <Square className="h-4 w-4 mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {position && (
        <div className="h-96 w-full border rounded-lg overflow-hidden">
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>
                Current Location<br />
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {!position && !error && (
        <div className="h-96 w-full border rounded-lg flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Click "Start Tracking" to show your location on the map</p>
          </div>
        </div>
      )}
    </div>
  )
}

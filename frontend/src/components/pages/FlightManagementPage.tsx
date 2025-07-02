import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { ArrowLeft, Plane, Clock, MapPin, AlertCircle } from 'lucide-react'
import { flightAPI, handleApiError } from '../../services/api'

interface FlightManagementPageProps {
  onBack: () => void
  tripId?: string
}

export function FlightManagementPage({ onBack, tripId }: FlightManagementPageProps) {
  const [loading, setLoading] = useState(false)
  const [flightData, setFlightData] = useState({
    airline: '',
    flight_number: '',
    departure_airport: '',
    arrival_airport: '',
    scheduled_departure: '',
    scheduled_arrival: '',
    gate: '',
    terminal: ''
  })

  const [flightStatus] = useState({
    status: 'On Time',
    actual_departure: '',
    actual_arrival: '',
    delay_minutes: 0,
    gate_changes: []
  })

  const handleInputChange = (field: string, value: string) => {
    setFlightData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tripId) {
      alert('No trip selected for flight information')
      return
    }

    setLoading(true)
    try {
      await flightAPI.updateFlightInfo(tripId, flightData)
      alert('Flight information updated successfully!')
      onBack()
    } catch (error) {
      handleApiError(error, 'update flight information')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on time': return 'bg-green-100 text-green-800'
      case 'delayed': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'boarding': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isFormValid = flightData.airline && flightData.flight_number && 
                     flightData.departure_airport && flightData.arrival_airport

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Management</h1>
          <p className="text-gray-600">Manage flight information and tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5" />
              <span>Flight Information</span>
            </CardTitle>
            <CardDescription>
              Enter or update flight details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="airline">Airline</Label>
                  <Input
                    id="airline"
                    value={flightData.airline}
                    onChange={(e) => handleInputChange('airline', e.target.value)}
                    placeholder="e.g., American Airlines"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flight_number">Flight Number</Label>
                  <Input
                    id="flight_number"
                    value={flightData.flight_number}
                    onChange={(e) => handleInputChange('flight_number', e.target.value)}
                    placeholder="e.g., AA1234"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_airport">Departure Airport</Label>
                  <Input
                    id="departure_airport"
                    value={flightData.departure_airport}
                    onChange={(e) => handleInputChange('departure_airport', e.target.value)}
                    placeholder="e.g., LAX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrival_airport">Arrival Airport</Label>
                  <Input
                    id="arrival_airport"
                    value={flightData.arrival_airport}
                    onChange={(e) => handleInputChange('arrival_airport', e.target.value)}
                    placeholder="e.g., JFK"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_departure">Scheduled Departure</Label>
                  <Input
                    id="scheduled_departure"
                    type="datetime-local"
                    value={flightData.scheduled_departure}
                    onChange={(e) => handleInputChange('scheduled_departure', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_arrival">Scheduled Arrival</Label>
                  <Input
                    id="scheduled_arrival"
                    type="datetime-local"
                    value={flightData.scheduled_arrival}
                    onChange={(e) => handleInputChange('scheduled_arrival', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="terminal">Terminal</Label>
                  <Input
                    id="terminal"
                    value={flightData.terminal}
                    onChange={(e) => handleInputChange('terminal', e.target.value)}
                    placeholder="e.g., Terminal 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gate">Gate</Label>
                  <Input
                    id="gate"
                    value={flightData.gate}
                    onChange={(e) => handleInputChange('gate', e.target.value)}
                    placeholder="e.g., A12"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isFormValid || loading}
                  className="transport-button-primary"
                >
                  {loading ? 'Updating...' : 'Update Flight Info'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Flight Status</span>
            </CardTitle>
            <CardDescription>
              Real-time flight tracking information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status</span>
              <Badge className={getStatusColor(flightStatus.status)}>
                {flightStatus.status}
              </Badge>
            </div>

            {flightStatus.delay_minutes > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Flight delayed by {flightStatus.delay_minutes} minutes
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Departure</span>
                </div>
                <span className="text-sm font-medium">
                  {flightData.scheduled_departure ? 
                    new Date(flightData.scheduled_departure).toLocaleString() : 
                    'Not scheduled'
                  }
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Arrival</span>
                </div>
                <span className="text-sm font-medium">
                  {flightData.scheduled_arrival ? 
                    new Date(flightData.scheduled_arrival).toLocaleString() : 
                    'Not scheduled'
                  }
                </span>
              </div>

              {flightData.gate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gate</span>
                  <span className="text-sm font-medium">{flightData.gate}</span>
                </div>
              )}

              {flightData.terminal && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Terminal</span>
                  <span className="text-sm font-medium">{flightData.terminal}</span>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => alert('Refreshing flight status...')}
            >
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

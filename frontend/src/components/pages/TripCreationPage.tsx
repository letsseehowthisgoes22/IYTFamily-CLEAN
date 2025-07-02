import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { ArrowLeft, MapPin, Calendar, Clock, Car, Plane } from 'lucide-react'
import { tripAPI, handleApiError } from '../../services/api'

interface TripCreationPageProps {
  onBack: () => void
  onTripCreated: (trip: any) => void
}

export function TripCreationPage({ onBack, onTripCreated }: TripCreationPageProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    origin_address: '',
    destination_address: '',
    scheduled_start: '',
    scheduled_end: '',
    transport_mode: 'driving' as 'driving' | 'flying',
    vehicle_info: '',
    notes: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tripData = {
        ...formData,
        scheduled_start: new Date(formData.scheduled_start).toISOString(),
        scheduled_end: formData.scheduled_end ? new Date(formData.scheduled_end).toISOString() : undefined
      }

      const createdTrip = await tripAPI.createTrip(tripData)
      onTripCreated(createdTrip)
      onBack()
    } catch (error) {
      handleApiError(error, 'create trip')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.client_id && formData.origin_address && 
                     formData.destination_address && formData.scheduled_start

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
          <p className="text-gray-600">Schedule a new transport trip</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Trip Details</span>
          </CardTitle>
          <CardDescription>
            Enter the details for the new transport trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  value={formData.client_id}
                  onChange={(e) => handleInputChange('client_id', e.target.value)}
                  placeholder="Enter client ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transport_mode">Transport Mode</Label>
                <Select value={formData.transport_mode} onValueChange={(value) => handleInputChange('transport_mode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>Driving</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="flying">
                      <div className="flex items-center space-x-2">
                        <Plane className="h-4 w-4" />
                        <span>Flying</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="origin_address">Origin Address</Label>
                <Input
                  id="origin_address"
                  value={formData.origin_address}
                  onChange={(e) => handleInputChange('origin_address', e.target.value)}
                  placeholder="Enter pickup address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination_address">Destination Address</Label>
                <Input
                  id="destination_address"
                  value={formData.destination_address}
                  onChange={(e) => handleInputChange('destination_address', e.target.value)}
                  placeholder="Enter destination address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduled_start">Scheduled Start</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="scheduled_start"
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => handleInputChange('scheduled_start', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_end">Scheduled End (Optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="scheduled_end"
                    type="datetime-local"
                    value={formData.scheduled_end}
                    onChange={(e) => handleInputChange('scheduled_end', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {formData.transport_mode === 'driving' && (
              <div className="space-y-2">
                <Label htmlFor="vehicle_info">Vehicle Information</Label>
                <Input
                  id="vehicle_info"
                  value={formData.vehicle_info}
                  onChange={(e) => handleInputChange('vehicle_info', e.target.value)}
                  placeholder="Vehicle make, model, license plate, etc."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or special instructions"
                rows={3}
              />
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
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

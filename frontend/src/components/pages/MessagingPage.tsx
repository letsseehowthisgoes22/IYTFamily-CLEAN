import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { ArrowLeft, MessageSquare, Send, User } from 'lucide-react'
import { messageAPI, handleApiError } from '../../services/api'

interface MessagingPageProps {
  onBack: () => void
  tripId?: string
}

export function MessagingPage({ onBack, tripId }: MessagingPageProps) {
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const mockMessages = [
    {
      id: '1',
      content: 'Trip has started. Currently en route to pickup location.',
      message_type: 'system',
      created_at: '2024-01-15T10:30:00Z',
      sender: { first_name: 'System', last_name: '', role: 'system' }
    },
    {
      id: '2',
      content: 'Client picked up successfully. Heading to destination.',
      message_type: 'text',
      created_at: '2024-01-15T11:15:00Z',
      sender: { first_name: 'John', last_name: 'Doe', role: 'staff' }
    },
    {
      id: '3',
      content: 'Thank you for the update. Please let us know when you arrive.',
      message_type: 'text',
      created_at: '2024-01-15T11:20:00Z',
      sender: { first_name: 'Sarah', last_name: 'Johnson', role: 'family' }
    },
    {
      id: '4',
      content: 'ETA updated to 2:30 PM due to traffic conditions.',
      message_type: 'alert',
      created_at: '2024-01-15T12:45:00Z',
      sender: { first_name: 'System', last_name: '', role: 'system' }
    }
  ]

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !tripId) {
      alert('Please enter a message and ensure a trip is selected')
      return
    }

    setLoading(true)
    try {
      await messageAPI.sendMessage(tripId, newMessage)
      setNewMessage('')
      alert('Message sent successfully!')
    } catch (error) {
      handleApiError(error, 'send message')
    } finally {
      setLoading(false)
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800'
      case 'alert': return 'bg-yellow-100 text-yellow-800'
      case 'text': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'family': return 'bg-green-100 text-green-800'
      case 'providers': return 'bg-purple-100 text-purple-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure Messaging</h1>
          <p className="text-gray-600">Communicate with trip participants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Trip Messages</span>
              </CardTitle>
              <CardDescription>
                Real-time communication for this trip
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                {mockMessages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {message.sender.first_name} {message.sender.last_name}
                        </span>
                        <Badge className={getRoleColor(message.sender.role)}>
                          {message.sender.role}
                        </Badge>
                        <Badge className={getMessageTypeColor(message.message_type)}>
                          {message.message_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Send Message</Label>
                  <Textarea
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onBack}>
                    Close
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || loading}
                    className="transport-button-primary"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">For Staff:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Provide regular location updates</li>
                  <li>• Report any delays or issues immediately</li>
                  <li>• Confirm pickup and drop-off</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">For Families:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Ask questions about trip progress</li>
                  <li>• Share important client information</li>
                  <li>• Request updates when needed</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Emergency:</h4>
                <p className="text-xs text-red-600">
                  For emergencies, call the emergency hotline immediately
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-gray-100 text-gray-800">text</Badge>
                <span className="text-xs">Regular messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">system</Badge>
                <span className="text-xs">Automated updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800">alert</Badge>
                <span className="text-xs">Important notifications</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

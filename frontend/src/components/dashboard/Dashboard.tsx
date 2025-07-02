import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { LogOut, MapPin, Plane, MessageSquare, FileText, Users, Settings } from 'lucide-react'
import { LiveMap } from '../map/LiveMap'
import { tripAPI, locationAPI, userAPI, Trip } from '../../services/api'
import { TripCreationPage } from '../pages/TripCreationPage'
import { SettingsPage } from '../pages/SettingsPage'
import { UserManagementPage } from '../pages/UserManagementPage'
import { FlightManagementPage } from '../pages/FlightManagementPage'
import { DocumentUploadPage } from '../pages/DocumentUploadPage'
import { MessagingPage } from '../pages/MessagingPage'
import { ClientManagementPage } from '../pages/ClientManagementPage'

interface User {
  id: string
  email: string
  role: 'admin' | 'staff' | 'family' | 'providers'
  first_name: string
  last_name: string
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [pageParams, setPageParams] = useState<Record<string, any>>({})
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApiError = (error: any, action: string) => {
    console.error(`Failed to ${action}:`, error)
    setError(`Failed to ${action}. Please try again.`)
    setTimeout(() => setError(null), 5000)
  }
  const [dashboardStats, setDashboardStats] = useState({
    activeTrips: 0,
    scheduledTrips: 0,
    unreadMessages: 0
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'family': return 'bg-green-100 text-green-800'
      case 'providers': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true)
      setError(null)
      try {
        const tripsData = await tripAPI.getTrips()
        setTrips(tripsData)
        
        const activeTrips = tripsData.filter((trip: Trip) => trip.status === 'in_progress').length
        const scheduledTrips = tripsData.filter((trip: Trip) => trip.status === 'scheduled').length
        
        setDashboardStats({
          activeTrips,
          scheduledTrips,
          unreadMessages: 2 // TODO: Implement messages API
        })
      } catch (err) {
        handleApiError(err, 'fetch trips')
        setError('Unable to load trips. Using offline data.')
        setTimeout(() => setError(null), 5000)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [user])

  const handleViewTripDetails = async (tripId: string) => {
    setSelectedTripId(tripId)
    setActiveTab('tracking')
    
    try {
      const locationData = await locationAPI.getCurrentLocation(tripId)
      console.log('Location data loaded for trip:', tripId, locationData)
    } catch (error) {
      console.warn('Could not load location data for trip:', tripId, error)
      handleApiError(error, 'load location data')
    }
  }

  const handleCreateNewTrip = () => {
    navigateToPage('tripCreation')
  }


  const handleUploadDocument = (tripId?: string) => {
    navigateToPage('documentUpload', { tripId })
  }

  const handleNewMessage = () => {
    navigateToPage('messaging', { tripId: selectedTripId })
  }

  const handleDownloadDocument = (documentId: string) => {
    alert(`Document ${documentId} download will start here. Feature coming soon!`)
    console.log('Download document:', documentId)
  }

  const handleDeleteDocument = (documentId: string) => {
    if (confirm(`Are you sure you want to delete document ${documentId}?`)) {
      alert(`Document ${documentId} deleted successfully!`)
      console.log('Delete document:', documentId)
    }
  }

  const handleAddFlightInfo = () => {
    navigateToPage('flightManagement', { tripId: selectedTripId })
  }

  const handleAddUser = () => {
    navigateToPage('userManagement')
  }

  const handleEditUser = (userId: string) => {
    navigateToPage('userManagement', { userId, mode: 'edit' })
  }

  const handleDisableUser = async (userId: string) => {
    if (confirm(`Are you sure you want to disable user ${userId}?`)) {
      try {
        await userAPI.disableUser(userId)
        alert('User disabled successfully!')
      } catch (error) {
        handleApiError(error, 'disable user')
        alert('Failed to disable user. Please try again.')
      }
    }
  }

  const handleConfigureSettings = () => {
    navigateToPage('settings')
  }

  const getTabsForRole = (role: string) => {
    const commonTabs = [
      { id: 'overview', label: 'Overview', icon: Users },
      { id: 'trips', label: 'Trips', icon: MapPin },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
    ]

    switch (role) {
      case 'admin':
        return [
          ...commonTabs,
          { id: 'users', label: 'Users', icon: Users },
          { id: 'clients', label: 'Client Management', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ]
      case 'staff':
        return [
          ...commonTabs,
          { id: 'tracking', label: 'Live Tracking', icon: MapPin },
          { id: 'flights', label: 'Flight Status', icon: Plane },
          { id: 'documents', label: 'Documents', icon: FileText },
        ]
      case 'family':
      case 'providers':
        return [
          ...commonTabs,
          { id: 'tracking', label: 'Track Trip', icon: MapPin },
          { id: 'documents', label: 'Documents', icon: FileText },
        ]
      default:
        return commonTabs
    }
  }

  const tabs = getTabsForRole(user.role)

  const navigateToPage = (page: string, params: Record<string, any> = {}) => {
    setCurrentPage(page)
    setPageParams(params)
  }

  const returnToDashboard = () => {
    setCurrentPage(null)
    setPageParams({})
  }

  const handleTripCreated = (trip: any) => {
    setTrips(prev => [...prev, trip])
    returnToDashboard()
  }

  if (currentPage === 'tripCreation') {
    return <TripCreationPage onBack={returnToDashboard} onTripCreated={handleTripCreated} />
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={returnToDashboard} />
  }

  if (currentPage === 'userManagement') {
    return <UserManagementPage onBack={returnToDashboard} />
  }

  if (currentPage === 'flightManagement') {
    return <FlightManagementPage onBack={returnToDashboard} tripId={pageParams.tripId} />
  }

  if (currentPage === 'documentUpload') {
    return <DocumentUploadPage onBack={returnToDashboard} tripId={pageParams.tripId} />
  }

  if (currentPage === 'messaging') {
    return <MessagingPage onBack={returnToDashboard} tripId={pageParams.tripId} />
  }

  if (currentPage === 'client-management') {
    return <ClientManagementPage onBack={returnToDashboard} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="transport-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo.jpg" alt="IYT Transport" className="h-8 w-auto" />
              <h1 className="text-xl font-semibold text-gray-900">
                IYT Family Transport
              </h1>
              <Badge className={getRoleColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.first_name} {user.last_name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Trips</CardTitle>
                  <CardDescription>Currently in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : dashboardStats.activeTrips}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Trips</CardTitle>
                  <CardDescription>Upcoming this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : dashboardStats.scheduledTrips}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Unread notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : dashboardStats.unreadMessages}</div>
                </CardContent>
              </Card>
            </div>
            {user.role === 'staff' && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Map Test</CardTitle>
                  <CardDescription>Testing the new live map functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveMap tripId="demo-trip-id" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Management</CardTitle>
                <CardDescription>View and manage transport trips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Active Trips</h3>
                    {user.role === 'staff' && (
                      <Button className="transport-button-primary" onClick={handleCreateNewTrip}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Create New Trip
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm">
                      <div>Trip ID</div>
                      <div>Client</div>
                      <div>Status</div>
                      <div>Departure</div>
                      <div>Destination</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {loading ? (
                        <div className="p-4 text-center">Loading trips...</div>
                      ) : trips.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {user.role === 'family' ? 'No trips found for your family member' : 
                           user.role === 'providers' ? 'No trips assigned to your facility' : 
                           'No trips found'}
                        </div>
                      ) : (
                        trips.map((trip: Trip) => (
                          <div key={trip.id} className="grid grid-cols-6 gap-4 p-4 items-center">
                            <div className="font-mono text-sm">{trip.id.toString().slice(0, 8)}</div>
                            <div>{trip.client?.first_name} {trip.client?.last_name}</div>
                            <div>
                              <Badge className={getStatusColor(trip.status)}>
                                {trip.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div>{trip.origin_address}</div>
                            <div>{trip.destination_address}</div>
                            <div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewTripDetails(trip.id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
                <CardDescription>Real-time location and status updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTripId ? (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Tracking Trip: {selectedTripId.slice(0, 8)}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedTripId(null)}
                        className="mt-2"
                      >
                        View All Trips
                      </Button>
                    </div>
                    {user.role === 'staff' ? (
                      <LiveMap tripId={selectedTripId} />
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Real-time location updates for this trip will appear here</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Select a trip from the Trips tab to view live tracking</p>
                    </div>
                    <div className="text-center">
                      <Button onClick={() => setActiveTab('trips')} className="transport-button-primary">
                        View Trips
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Secure Messaging</CardTitle>
                <CardDescription>Communicate with authorized parties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Messages</h3>
                    <Button className="transport-button-primary" onClick={handleNewMessage}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Trip TRP-001 Update</div>
                        <div className="text-sm text-gray-500">2 hours ago</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Client pickup completed successfully. Currently en route to destination.
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">From: Transport Staff</div>
                        <Button variant="outline" size="sm" onClick={handleNewMessage}>Reply</Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Schedule Confirmation</div>
                        <div className="text-sm text-gray-500">1 day ago</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Trip TRP-002 scheduled for tomorrow at 9:00 AM. Please confirm client availability.
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">From: Family Member</div>
                        <Button variant="outline" size="sm" onClick={handleNewMessage}>Reply</Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Document Request</div>
                        <div className="text-sm text-gray-500">2 days ago</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Please upload the medical clearance form for upcoming transport.
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">From: Admin</div>
                        <Button variant="outline" size="sm" onClick={handleNewMessage}>Reply</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Upload and manage trip documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Trip Documents</h3>
                    {(user.role === 'staff' || user.role === 'admin') && (
                      <Button className="transport-button-primary" onClick={() => handleUploadDocument()}>
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                      <div>Document Name</div>
                      <div>Type</div>
                      <div>Trip ID</div>
                      <div>Uploaded</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      <div className="grid grid-cols-5 gap-4 p-4 items-center">
                        <div>Medical Clearance Form</div>
                        <div><Badge variant="outline">Medical</Badge></div>
                        <div className="font-mono text-sm">TRP-001</div>
                        <div className="text-sm text-gray-500">2 days ago</div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument('doc-id')}>Download</Button>
                          {(user.role === 'staff' || user.role === 'admin') && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteDocument('doc-id')}>Delete</Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 p-4 items-center">
                        <div>Consent Form</div>
                        <div><Badge variant="outline">Legal</Badge></div>
                        <div className="font-mono text-sm">TRP-002</div>
                        <div className="text-sm text-gray-500">1 day ago</div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument('doc-id')}>Download</Button>
                          {(user.role === 'staff' || user.role === 'admin') && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteDocument('doc-id')}>Delete</Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 p-4 items-center">
                        <div>Travel Itinerary</div>
                        <div><Badge variant="outline">Travel</Badge></div>
                        <div className="font-mono text-sm">TRP-001</div>
                        <div className="text-sm text-gray-500">3 days ago</div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument('doc-id')}>Download</Button>
                          {(user.role === 'staff' || user.role === 'admin') && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteDocument('doc-id')}>Delete</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Flight Integration</CardTitle>
                <CardDescription>Track flight status and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Flight Status</h3>
                    {user.role === 'staff' && (
                      <Button className="transport-button-primary" onClick={handleAddFlightInfo}>
                        <Plane className="h-4 w-4 mr-2" />
                        Add Flight Info
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AA 1234</CardTitle>
                        <CardDescription>American Airlines</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge className="bg-green-100 text-green-800">On Time</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Departure:</span>
                            <span className="text-sm">DFW - 2:30 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Arrival:</span>
                            <span className="text-sm">PHX - 4:15 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Gate:</span>
                            <span className="text-sm">A12</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Trip:</span>
                            <span className="text-sm font-mono">TRP-001</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">UA 5678</CardTitle>
                        <CardDescription>United Airlines</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge className="bg-yellow-100 text-yellow-800">Delayed</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Departure:</span>
                            <span className="text-sm">IAH - 10:45 AM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Arrival:</span>
                            <span className="text-sm">DEN - 12:30 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Gate:</span>
                            <span className="text-sm">B7</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Trip:</span>
                            <span className="text-sm font-mono">TRP-002</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'admin' && (
            <>
              <TabsContent value="clients" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Management</CardTitle>
                    <CardDescription>Manage clients and their assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Client Assignment</h3>
                        <Button 
                          className="transport-button-primary" 
                          onClick={() => navigateToPage('client-management')}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Clients
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">
                        Assign clients to family and provider users to control access to trip information.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage system users and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">System Users</h3>
                        <Button className="transport-button-primary" onClick={handleAddUser}>
                          <Users className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                      <div className="border rounded-lg">
                        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                          <div>Name</div>
                          <div>Email</div>
                          <div>Role</div>
                          <div>Status</div>
                          <div>Actions</div>
                        </div>
                        <div className="divide-y">
                          <div className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div>John Smith</div>
                            <div>john.smith@iyt.com</div>
                            <div><Badge className="bg-blue-100 text-blue-800">Staff</Badge></div>
                            <div><Badge className="bg-green-100 text-green-800">Active</Badge></div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditUser('user-id')}>Edit</Button>
                              <Button variant="outline" size="sm" onClick={() => handleDisableUser('user-id')}>Disable</Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div>Sarah Johnson</div>
                            <div>sarah.j@family.com</div>
                            <div><Badge className="bg-green-100 text-green-800">Family</Badge></div>
                            <div><Badge className="bg-green-100 text-green-800">Active</Badge></div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditUser('user-id')}>Edit</Button>
                              <Button variant="outline" size="sm" onClick={() => handleDisableUser('user-id')}>Disable</Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div>Dr. Mike Davis</div>
                            <div>m.davis@provider.com</div>
                            <div><Badge className="bg-purple-100 text-purple-800">Provider</Badge></div>
                            <div><Badge className="bg-green-100 text-green-800">Active</Badge></div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditUser('user-id')}>Edit</Button>
                              <Button variant="outline" size="sm" onClick={() => handleDisableUser('user-id')}>Disable</Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div>Admin User</div>
                            <div>admin@iyt.com</div>
                            <div><Badge className="bg-red-100 text-red-800">Admin</Badge></div>
                            <div><Badge className="bg-green-100 text-green-800">Active</Badge></div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditUser('user-id')}>Edit</Button>
                              <Button variant="outline" size="sm" disabled>Disable</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports & Analytics</CardTitle>
                    <CardDescription>View system reports and analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Total Trips</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">127</div>
                            <div className="text-sm text-gray-600">This month</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Success Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">98.4%</div>
                            <div className="text-sm text-gray-600">Completed successfully</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Avg Duration</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">4.2h</div>
                            <div className="text-sm text-gray-600">Per trip</div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Trips completed today</span>
                                <span className="font-medium">5</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Active staff members</span>
                                <span className="font-medium">12</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Messages sent</span>
                                <span className="font-medium">23</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Documents uploaded</span>
                                <span className="font-medium">8</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>System Health</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">GPS Tracking</span>
                                <Badge className="bg-green-100 text-green-800">Online</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Flight API</span>
                                <Badge className="bg-green-100 text-green-800">Connected</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Messaging</span>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Database</span>
                                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure system settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Notification Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Email notifications</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Configure</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">SMS alerts</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Configure</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Push notifications</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Configure</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Security Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Password policy</span>
                              <Button variant="outline" size="sm" onClick={() => handleEditUser('user-id')}>Edit</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Session timeout</span>
                              <Button variant="outline" size="sm" onClick={() => handleEditUser('user-id')}>Edit</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Two-factor auth</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Configure</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">GPS & Tracking</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Update interval</span>
                              <Button variant="outline" size="sm">10 seconds</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Geofence alerts</span>
                              <Button variant="outline" size="sm">Enabled</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Location history</span>
                              <Button variant="outline" size="sm">30 days</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Integration Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Flight API key</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Update</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Email service</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Configure</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">SMS provider</span>
                              <Button variant="outline" size="sm" onClick={handleConfigureSettings}>Configure</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  )
}

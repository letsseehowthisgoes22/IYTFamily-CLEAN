import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { ArrowLeft, Users, UserPlus, UserCheck, UserX, Search } from 'lucide-react'
import { clientAPI, userAPI, handleApiError, Client, ClientCreate } from '../../services/api'

interface ClientManagementPageProps {
  onBack: () => void
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
}

export function ClientManagementPage({ onBack }: ClientManagementPageProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [unassignedClients, setUnassignedClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>('')

  const [newClient, setNewClient] = useState<ClientCreate>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_notes: '',
    family_user_id: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [clientsData, usersData, unassignedData] = await Promise.all([
        clientAPI.getClients(),
        userAPI.getUsers(),
        clientAPI.getUnassignedClients()
      ])
      setClients(clientsData)
      setUsers(usersData.filter((user: User) => 
        user.role === 'family' || user.role === 'providers'
      ))
      setUnassignedClients(unassignedData)
    } catch (error) {
      handleApiError(error, 'load client data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await clientAPI.createClient(newClient)
      setNewClient({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_notes: '',
        family_user_id: ''
      })
      setShowCreateForm(false)
      await loadData()
      alert('Client created successfully!')
    } catch (error) {
      handleApiError(error, 'create client')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignClient = async () => {
    if (!selectedClient || !selectedUser) return
    
    setLoading(true)
    try {
      await clientAPI.assignClientToFamily(selectedClient.id, selectedUser)
      setSelectedClient(null)
      setSelectedUser('')
      await loadData()
      alert('Client assigned successfully!')
    } catch (error) {
      handleApiError(error, 'assign client')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to unassign this client?')) return
    
    setLoading(true)
    try {
      await clientAPI.unassignClientFromFamily(clientId)
      await loadData()
      alert('Client unassigned successfully!')
    } catch (error) {
      handleApiError(error, 'unassign client')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.family_user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const familyProviderUsers = users.filter(user => 
    user.role === 'family' || user.role === 'providers'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage clients and their family/provider assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <CardTitle>All Clients</CardTitle>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="transport-button-primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
            <CardDescription>
              Manage client assignments to family and provider users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name or assigned user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredClients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {client.first_name} {client.last_name}
                      </h3>
                      {client.date_of_birth && (
                        <p className="text-sm text-gray-500">
                          DOB: {new Date(client.date_of_birth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {client.family_user ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignClient(client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {client.family_user && (
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <strong>Assigned to:</strong> {client.family_user.first_name} {client.family_user.last_name} 
                      ({client.family_user.email}) - {client.family_user.role}
                    </div>
                  )}
                  
                  {client.emergency_contact_name && (
                    <div className="text-sm text-gray-600">
                      <strong>Emergency Contact:</strong> {client.emergency_contact_name}
                      {client.emergency_contact_phone && ` - ${client.emergency_contact_phone}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {unassignedClients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Unassigned Clients</CardTitle>
                <CardDescription>
                  Clients that need family/provider assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unassignedClients.map((client) => (
                    <div key={client.id} className="border rounded p-2">
                      <div className="font-medium text-sm">
                        {client.first_name} {client.last_name}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClient(client)}
                        className="mt-1 w-full"
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle>Assign Client</CardTitle>
                <CardDescription>
                  Assign {selectedClient.first_name} {selectedClient.last_name} to a family/provider user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Family/Provider User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {familyProviderUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAssignClient}
                    disabled={!selectedUser || loading}
                    className="transport-button-primary flex-1"
                  >
                    {loading ? 'Assigning...' : 'Assign'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedClient(null)
                      setSelectedUser('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Client</CardTitle>
            <CardDescription>
              Add a new client to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newClient.first_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newClient.date_of_birth}
                    onChange={(e) => setNewClient(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={newClient.emergency_contact_phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={newClient.emergency_contact_name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_notes">Medical Notes</Label>
                <Textarea
                  id="medical_notes"
                  value={newClient.medical_notes}
                  onChange={(e) => setNewClient(prev => ({ ...prev, medical_notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="transport-button-primary"
                >
                  {loading ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

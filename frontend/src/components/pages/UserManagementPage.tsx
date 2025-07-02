import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { ArrowLeft, Users, Plus, Edit, Trash2, UserCheck } from 'lucide-react'
import { userAPI, handleApiError } from '../../services/api'

interface UserManagementPageProps {
  onBack: () => void
}

export function UserManagementPage({ onBack }: UserManagementPageProps) {
  const [activeView, setActiveView] = useState<'list' | 'add' | 'edit'>('list')
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'family' as 'admin' | 'staff' | 'family' | 'providers',
    phone: '',
    password: ''
  })

  const mockUsers = [
    { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'staff', status: 'active' },
    { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'family', status: 'active' },
    { id: '3', first_name: 'Dr. Mike', last_name: 'Johnson', email: 'mike@clinic.com', role: 'providers', status: 'active' },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddUser = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'family',
      phone: '',
      password: ''
    })
    setActiveView('add')
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      password: ''
    })
    setActiveView('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (activeView === 'add') {
        await userAPI.createUser(formData)
        alert('User created successfully!')
      } else if (activeView === 'edit' && selectedUser) {
        await userAPI.updateUser(selectedUser.id, formData)
        alert('User updated successfully!')
      }
      setActiveView('list')
    } catch (error) {
      handleApiError(error, activeView === 'add' ? 'create user' : 'update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDisableUser = async (userId: string) => {
    if (confirm('Are you sure you want to disable this user?')) {
      try {
        await userAPI.disableUser(userId)
        alert('User disabled successfully!')
      } catch (error) {
        handleApiError(error, 'disable user')
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'family': return 'bg-green-100 text-green-800'
      case 'providers': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (activeView === 'add' || activeView === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setActiveView('list')} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeView === 'add' ? 'Add New User' : 'Edit User'}
            </h1>
            <p className="text-gray-600">
              {activeView === 'add' ? 'Create a new user account' : 'Update user information'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Information</span>
            </CardTitle>
            <CardDescription>
              Enter the user details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="providers">Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeView === 'add' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setActiveView('list')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="transport-button-primary"
                >
                  {loading ? 'Saving...' : (activeView === 'add' ? 'Create User' : 'Update User')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
        </div>
        <Button onClick={handleAddUser} className="transport-button-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>System Users</span>
          </CardTitle>
          <CardDescription>
            View and manage all system users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

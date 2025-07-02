import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ArrowLeft, Bell, Shield, MapPin, Zap } from 'lucide-react'

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    gpsUpdateInterval: localStorage.getItem('gpsUpdateInterval') || '10',
    notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true',
    autoRefreshEnabled: localStorage.getItem('autoRefreshEnabled') === 'true',
    emailNotifications: true,
    smsAlerts: true,
    pushNotifications: true,
    sessionTimeout: '30',
    twoFactorAuth: false,
    geofenceAlerts: true,
    locationHistoryDays: '30'
  })

  const [loading, setLoading] = useState(false)

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      localStorage.setItem('gpsUpdateInterval', settings.gpsUpdateInterval)
      localStorage.setItem('notificationsEnabled', settings.notificationsEnabled.toString())
      localStorage.setItem('autoRefreshEnabled', settings.autoRefreshEnabled.toString())
      
      setTimeout(() => {
        setLoading(false)
        alert('Settings saved successfully!')
      }, 1000)
    } catch (error) {
      setLoading(false)
      alert('Failed to save settings. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Settings</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive trip updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-gray-500">Get urgent alerts via SMS</p>
              </div>
              <Switch
                checked={settings.smsAlerts}
                onCheckedChange={(checked) => handleSettingChange('smsAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>
              Manage security and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Add extra security to your account</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>GPS & Tracking</span>
            </CardTitle>
            <CardDescription>
              Configure location tracking settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gpsUpdateInterval">GPS Update Interval</Label>
              <Select value={settings.gpsUpdateInterval} onValueChange={(value) => handleSettingChange('gpsUpdateInterval', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Geofence Alerts</Label>
                <p className="text-sm text-gray-500">Alert when leaving designated areas</p>
              </div>
              <Switch
                checked={settings.geofenceAlerts}
                onCheckedChange={(checked) => handleSettingChange('geofenceAlerts', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationHistoryDays">Location History Retention</Label>
              <Select value={settings.locationHistoryDays} onValueChange={(value) => handleSettingChange('locationHistoryDays', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>System Preferences</span>
            </CardTitle>
            <CardDescription>
              General system behavior settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-refresh Trip Data</Label>
                <p className="text-sm text-gray-500">Automatically update trip information</p>
              </div>
              <Switch
                checked={settings.autoRefreshEnabled}
                onCheckedChange={(checked) => handleSettingChange('autoRefreshEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="transport-button-primary"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}

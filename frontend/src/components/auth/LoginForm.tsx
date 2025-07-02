import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'admin' | 'staff' | 'family' | 'providers'
  first_name: string
  last_name: string
}

interface LoginFormProps {
  onLogin: (user: User, token: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with:', { email, password })
    setLoading(true)
    setError('')

    try {
      const validCredentials = [
        'admin@test.com',
        'staff@test.com', 
        'provider@test.com',
        'family@test.com'
      ]

      if (!validCredentials.includes(email) || password !== 'password123') {
        throw new Error('Invalid credentials')
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email,
        role: email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : email.includes('provider') ? 'providers' : 'family',
        first_name: 'Test',
        last_name: 'User'
      }

      onLogin(mockUser, 'mock-token-123')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transport-gradient">
      <Card className="w-full max-w-md transport-card">
        <CardHeader className="text-center">
          <img src="/logo.jpg" alt="IYT Transport" className="h-12 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">IYT Family Transport</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  console.log('Email changed to:', e.target.value)
                  setEmail(e.target.value)
                }}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  console.log('Password changed to:', e.target.value)
                  setPassword(e.target.value)
                }}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full transport-button-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

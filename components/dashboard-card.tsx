'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, MousePointerClick, TrendingUp, Plus, LogOut } from 'lucide-react'

interface User {
  user_id: string
  email: string
  role: string
}

interface DashboardCardProps {
  user: User
  onLogout: () => void
  loggingOut: boolean
}

export default function DashboardCard({ user, onLogout, loggingOut }: DashboardCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border bg-white p-6 max-w-2xl w-full">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        <p className="text-sm text-neutral-600 mt-1">
          Welcome, <span className="font-medium">{user.email}</span>
        </p>
      </CardHeader>
      
      <CardContent className="p-0 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Links</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Link2 className="h-8 w-8 text-neutral-400" />
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Clicks Today</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <MousePointerClick className="h-8 w-8 text-neutral-400" />
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Clicks</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-neutral-400" />
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Links</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-600">User ID</p>
              <p className="font-mono text-xs mt-1 text-neutral-500">{user.user_id}</p>
            </div>
            <div>
              <p className="text-neutral-600">Role</p>
              <p className="mt-1 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1"
            size="lg"
            disabled
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Link
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            onClick={onLogout}
            disabled={loggingOut}
            className="sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
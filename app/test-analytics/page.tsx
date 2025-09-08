'use client'

import { useEffect, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAnalyticsPage() {
  const { trackPageView, trackActionClick, trackAuth, trackDashboard } = useAnalytics()
  const [events, setEvents] = useState<string[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>({})

  useEffect(() => {
    // Track page view on mount
    const testSlug = 'test-analytics-site'
    trackPageView(testSlug, '/test-analytics')
    addEvent('Page view tracked')

    // Get session info from localStorage/sessionStorage
    const visitorId = localStorage.getItem('analytics_visitor_id')
    const sessionId = sessionStorage.getItem('analytics_session_id')
    const returningVisitor = localStorage.getItem('analytics_returning_visitor')
    
    setSessionInfo({
      visitorId,
      sessionId,
      isReturning: !!returningVisitor
    })
  }, [trackPageView])

  const addEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setEvents(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  const testActionClick = (index: number) => {
    trackActionClick('test-analytics-site', index, `Test Button ${index}`)
    addEvent(`Action click tracked: Button ${index}`)
  }

  const testAuthEvent = (type: 'login' | 'logout') => {
    trackAuth('test-analytics-site', type)
    addEvent(`Auth event tracked: ${type}`)
  }

  const testDashboardEvent = (action?: string) => {
    trackDashboard('test-analytics-site', action)
    addEvent(`Dashboard event tracked: ${action || 'view'}`)
  }

  const checkAPIHealth = async () => {
    try {
      const response = await fetch('/api/analytics/test-analytics-site?metric=overview')
      if (response.ok) {
        const data = await response.json()
        addEvent(`API health check passed. Total events: ${data.totals?.pageViews || 0}`)
      } else {
        const errorText = await response.text()
        addEvent(`API health check failed: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      addEvent(`API health check error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Analytics System Test</h1>

      <div className="grid gap-6">
        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Current tracking session details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div>Visitor ID: {sessionInfo.visitorId || 'Not set'}</div>
              <div>Session ID: {sessionInfo.sessionId || 'Not set'}</div>
              <div>Returning Visitor: {sessionInfo.isReturning ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Event Tracking</CardTitle>
            <CardDescription>Click buttons to trigger analytics events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Action Clicks</h3>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(index => (
                    <Button
                      key={index}
                      onClick={() => testActionClick(index)}
                      variant="outline"
                    >
                      Button {index}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Auth Events</h3>
                <div className="flex gap-2">
                  <Button onClick={() => testAuthEvent('login')} variant="outline">
                    Track Login
                  </Button>
                  <Button onClick={() => testAuthEvent('logout')} variant="outline">
                    Track Logout
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Dashboard Events</h3>
                <div className="flex gap-2">
                  <Button onClick={() => testDashboardEvent()} variant="outline">
                    Track View
                  </Button>
                  <Button onClick={() => testDashboardEvent('edit')} variant="outline">
                    Track Edit
                  </Button>
                  <Button onClick={() => testDashboardEvent('delete')} variant="outline">
                    Track Delete
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">API Health</h3>
                <Button onClick={checkAPIHealth} variant="outline">
                  Check API Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>Recent tracking events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-sm max-h-64 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-gray-500">No events tracked yet</div>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="text-gray-700">
                    {event}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>First, run the SQL script in Supabase to create analytics tables</li>
              <li>Click the test buttons above to generate events</li>
              <li>Check the browser console for any errors</li>
              <li>Visit /dashboard/analytics/test-analytics-site to see the data</li>
              <li>Check your Supabase database for new rows in analytics_events table</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
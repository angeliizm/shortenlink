'use client'

import { PageAction } from '@/lib/types/page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Shield } from 'lucide-react'
import ActionButton from './ActionButton'

interface FallbackCardProps {
  title: string
  targetUrl: string
  actions: PageAction[]
  brandColor: string
}

export default function FallbackCard({ title, targetUrl, actions, brandColor }: FallbackCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100">
            <Shield className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            This content cannot be embedded directly due to security settings.
            You can open it in a new tab to access the full experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            size="lg"
            style={{ backgroundColor: brandColor }}
            asChild
          >
            <a 
              href={targetUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Open in New Tab
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          
          {actions.filter(a => a.isEnabled).length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {actions
                  .filter(action => action.isEnabled)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map(action => (
                    <ActionButton 
                      key={action.id} 
                      action={action} 
                      size="default"
                    />
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
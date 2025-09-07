'use client'

import { PageAction } from '@/lib/types/page'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface ActionButtonProps {
  action: PageAction
  size?: 'default' | 'sm' | 'lg'
}

export default function ActionButton({ action, size = 'sm' }: ActionButtonProps) {
  return (
    <Button
      variant={action.variant === 'primary' ? 'outline' : action.variant}
      size={size}
      asChild
    >
      <a 
        href={action.href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1"
      >
        {action.label}
      </a>
    </Button>
  )
}
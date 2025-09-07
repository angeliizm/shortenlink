'use client'

import { PageAction } from '@/lib/types/page'
import ActionButton from './ActionButton'

interface TopBarProps {
  title: string
  brandColor: string
  actions: PageAction[]
}

export default function TopBar({ title, brandColor, actions }: TopBarProps) {
  return (
    <header 
      className="h-16 flex items-center justify-between px-4 sm:px-6 shadow-md relative z-10"
      style={{ backgroundColor: brandColor }}
    >
      <h1 className="text-lg sm:text-xl font-semibold text-white truncate max-w-[50%]">
        {title}
      </h1>
      
      <div className="flex items-center gap-2">
        {actions
          .filter(action => action.isEnabled)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(action => (
            <ActionButton key={action.id} action={action} />
          ))}
      </div>
    </header>
  )
}
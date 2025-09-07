'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface Site {
  id: string
  title: string
  site_slug: string
}

interface DeleteSiteDialogProps {
  site: Site | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (siteId: string) => void
}

export default function DeleteSiteDialog({ site, open, onOpenChange, onConfirm }: DeleteSiteDialogProps) {
  if (!site) return null
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Site
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete <strong>{site.title}</strong>?</p>
            <p className="text-sm">
              This will permanently delete the site at <code className="bg-gray-100 px-1 py-0.5 rounded">/siteler/{site.site_slug}</code> 
              and all associated actions. This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(site.id)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Site
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
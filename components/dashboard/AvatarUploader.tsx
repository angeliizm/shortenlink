'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AvatarUploaderProps {
  siteId: string
  currentAvatarUrl?: string
  onAvatarChange: (url: string) => void
}

export function AvatarUploader({ siteId, currentAvatarUrl, onAvatarChange }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('siteId', siteId)

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      onAvatarChange(result.url)
      setUploadSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)

    } catch (error: any) {
      setUploadError(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return

    try {
      // Delete from Vercel Blob
      const response = await fetch(`/api/delete-avatar?url=${encodeURIComponent(currentAvatarUrl)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        console.warn('Failed to delete avatar from blob storage:', result.error)
        // Continue with local removal even if blob deletion fails
      }

      // Remove from local state
      onAvatarChange('')
      setUploadError(null)
      setUploadSuccess(false)
    } catch (error) {
      console.error('Error removing avatar:', error)
      // Still remove from local state even if blob deletion fails
      onAvatarChange('')
      setUploadError(null)
      setUploadSuccess(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Avatar Display */}
      {currentAvatarUrl && (
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentAvatarUrl}
              alt="Current avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <button
              onClick={handleRemoveAvatar}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Current Avatar</p>
            <p className="text-xs text-gray-500">Click X to remove</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {currentAvatarUrl ? 'Change Avatar' : 'Upload Avatar'}
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-xs text-gray-500 text-center">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-600">{uploadError}</p>
          </motion.div>
        )}

        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">Avatar uploaded successfully!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

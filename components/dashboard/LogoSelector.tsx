'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon, Check, Search } from 'lucide-react'
import Image from 'next/image'

interface LogoSelectorProps {
  siteId: string
  currentLogo?: string
  onSave: (logoPath: string | null) => void
  onClose: () => void
  title?: string
  description?: string
}

interface LogoFile {
  name: string
  path: string
  size: number
  type: string
}

export default function LogoSelector({ 
  siteId, 
  currentLogo, 
  onSave, 
  onClose,
  title = "Logo Seçimi",
  description = "Buton kutucuklarınız için logo seçin"
}: LogoSelectorProps) {
  const [availableLogos, setAvailableLogos] = useState<LogoFile[]>([])
  const [selectedLogo, setSelectedLogo] = useState<string | null>(currentLogo || null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mevcut logoları yükle
  useEffect(() => {
    loadAvailableLogos()
  }, [])

  const loadAvailableLogos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // API endpoint'inden mevcut logoları al
      const response = await fetch('/api/logos/list')
      if (!response.ok) {
        throw new Error('Logolar yüklenirken hata oluştu')
      }
      
      const logos = await response.json()
      setAvailableLogos(logos)
    } catch (err) {
      console.error('Logo yükleme hatası:', err)
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    onSave(selectedLogo)
    onClose()
  }

  const handleRemoveLogo = () => {
    setSelectedLogo(null)
  }

  const filteredLogos = availableLogos.filter(logo =>
    logo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                {title}
              </CardTitle>
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Logolar yükleniyor...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <X className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Hata</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
              <Button onClick={loadAvailableLogos} variant="outline">
                Tekrar Dene
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Logo ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mevcut Logo Seçimi */}
              {currentLogo && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Mevcut Logo</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                      <Image
                        src={currentLogo}
                        alt="Mevcut Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Mevcut Logo</p>
                      <p className="text-xs text-gray-500">Şu anda kullanılan logo</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Kaldır
                    </Button>
                  </div>
                </div>
              )}

              {/* Logo Seçenekleri */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Mevcut Logolar ({filteredLogos.length})
                </Label>
                
                {filteredLogos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Henüz logo yüklenmemiş</p>
                    <p className="text-xs text-gray-400 mt-1">
                      public/images klasörüne logo dosyalarınızı ekleyin
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredLogos.map((logo, index) => (
                      <div
                        key={logo.path}
                        className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                          selectedLogo === logo.path
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => setSelectedLogo(logo.path)}
                      >
                        <div className="aspect-square p-3 flex items-center justify-center">
                          <div className="relative w-full h-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                            <Image
                              src={logo.path}
                              alt={logo.name}
                              width={120}
                              height={120}
                              className="object-contain"
                            />
                          </div>
                        </div>
                        
                        {/* Seçim göstergesi */}
                        {selectedLogo === logo.path && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        {/* Logo bilgileri */}
                        <div className="p-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-900 truncate" title={logo.name}>
                            {logo.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(logo.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {selectedLogo ? (
                <span className="text-green-600">✓ Logo seçildi</span>
              ) : (
                <span className="text-gray-500">Logo seçilmedi</span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none sm:px-6"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 sm:flex-none sm:px-6 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export interface PageAction {
  id: string
  label: string
  href: string
  variant: 'primary' | 'outline' | 'ghost'
  preset?: string
  description?: string
  sortOrder: number
  isEnabled: boolean
}

export interface PageMeta {
  noindex?: boolean
  description?: string
  [key: string]: any
}

export interface PageConfig {
  id: string
  slug: string  // For analytics tracking
  siteSlug: string
  title: string
  targetUrl: string
  meta?: PageMeta
  isEnabled: boolean
  actions: PageAction[]
  customDomain?: string
  userId?: string
  avatarUrl?: string
  logoUrl?: string
  profilePresetId?: string
  titleFontPresetId?: string
  titleColor?: string
  titleFontSize?: number
  backgroundPreference?: {
    presetId: string
    controlValues: Record<string, string | number>
  } | null
  titleStylePreference?: {
    presetId: string
    customSettings?: Record<string, any>
  } | null
}
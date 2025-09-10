export interface PageAction {
  id: string
  label: string
  href: string
  variant: 'primary' | 'outline' | 'ghost'
  preset?: string
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
  brandColor: string
  accentColor?: string
  targetUrl: string
  meta?: PageMeta
  isEnabled: boolean
  actions: PageAction[]
  customDomain?: string
  userId?: string
  avatarUrl?: string
  backgroundPreference?: {
    presetId: string
    controlValues: Record<string, string | number>
  } | null
  titleStylePreference?: {
    presetId: string
    customSettings?: Record<string, any>
  } | null
}
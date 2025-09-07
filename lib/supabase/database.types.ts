export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          user_id: string
          slug: string
          target_url: string
          password: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          target_url: string
          password?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          target_url?: string
          password?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clicks: {
        Row: {
          id: string
          link_id: string
          clicked_at: string
          ip_address: string | null
          user_agent: string | null
          referer: string | null
          country: string | null
          city: string | null
        }
        Insert: {
          id?: string
          link_id: string
          clicked_at?: string
          ip_address?: string | null
          user_agent?: string | null
          referer?: string | null
          country?: string | null
          city?: string | null
        }
        Update: {
          id?: string
          link_id?: string
          clicked_at?: string
          ip_address?: string | null
          user_agent?: string | null
          referer?: string | null
          country?: string | null
          city?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Link = Database['public']['Tables']['links']['Row']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type LinkUpdate = Database['public']['Tables']['links']['Update']

export type Click = Database['public']['Tables']['clicks']['Row']
export type ClickInsert = Database['public']['Tables']['clicks']['Insert']
export type ClickUpdate = Database['public']['Tables']['clicks']['Update']
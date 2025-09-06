export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'user' | 'admin'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'user' | 'admin'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'user' | 'admin'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      domains: {
        Row: {
          id: string
          user_id: string
          domain: string
          verified: boolean
          verification_txt: string
          verification_attempts: number
          last_verification_at: string | null
          ssl_status: string
          created_at: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          verified?: boolean
          verification_txt?: string
          verification_attempts?: number
          last_verification_at?: string | null
          ssl_status?: string
          created_at?: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          verified?: boolean
          verification_txt?: string
          verification_attempts?: number
          last_verification_at?: string | null
          ssl_status?: string
          created_at?: string
          verified_at?: string | null
        }
      }
      links: {
        Row: {
          id: string
          user_id: string
          domain_id: string
          slug: string
          target_url: string
          redirect_type: '301' | '302'
          title: string | null
          password_hash: string | null
          expires_at: string | null
          click_limit: number | null
          one_time: boolean
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          device_targeting: Json | null
          geo_targeting: Json | null
          qr_logo_url: string | null
          total_clicks: number
          unique_clicks: number
          is_active: boolean
          created_at: string
          updated_at: string
          last_clicked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          domain_id: string
          slug: string
          target_url: string
          redirect_type?: '301' | '302'
          title?: string | null
          password_hash?: string | null
          expires_at?: string | null
          click_limit?: number | null
          one_time?: boolean
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          device_targeting?: Json | null
          geo_targeting?: Json | null
          qr_logo_url?: string | null
          total_clicks?: number
          unique_clicks?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_clicked_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          domain_id?: string
          slug?: string
          target_url?: string
          redirect_type?: '301' | '302'
          title?: string | null
          password_hash?: string | null
          expires_at?: string | null
          click_limit?: number | null
          one_time?: boolean
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          device_targeting?: Json | null
          geo_targeting?: Json | null
          qr_logo_url?: string | null
          total_clicks?: number
          unique_clicks?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_clicked_at?: string | null
        }
      }
      link_tags: {
        Row: {
          link_id: string
          tag: string
        }
        Insert: {
          link_id: string
          tag: string
        }
        Update: {
          link_id?: string
          tag?: string
        }
      }
      clicks: {
        Row: {
          id: string
          link_id: string
          ip_hash: string
          user_agent: string | null
          accept_language: string | null
          referrer: string | null
          country_code: string | null
          city: string | null
          region: string | null
          latitude: number | null
          longitude: number | null
          device_type: string | null
          os: string | null
          os_version: string | null
          browser: string | null
          browser_version: string | null
          is_bot: boolean
          bot_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          link_id: string
          ip_hash: string
          user_agent?: string | null
          accept_language?: string | null
          referrer?: string | null
          country_code?: string | null
          city?: string | null
          region?: string | null
          latitude?: number | null
          longitude?: number | null
          device_type?: string | null
          os?: string | null
          os_version?: string | null
          browser?: string | null
          browser_version?: string | null
          is_bot?: boolean
          bot_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          ip_hash?: string
          user_agent?: string | null
          accept_language?: string | null
          referrer?: string | null
          country_code?: string | null
          city?: string | null
          region?: string | null
          latitude?: number | null
          longitude?: number | null
          device_type?: string | null
          os?: string | null
          os_version?: string | null
          browser?: string | null
          browser_version?: string | null
          is_bot?: boolean
          bot_name?: string | null
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          scopes: string[]
          rate_limit: number
          last_used_at: string | null
          expires_at: string | null
          created_at: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          scopes?: string[]
          rate_limit?: number
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          scopes?: string[]
          rate_limit?: number
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
      }
      webhooks: {
        Row: {
          id: string
          user_id: string
          name: string
          url: string
          secret: string
          events: string[]
          is_active: boolean
          consecutive_failures: number
          last_triggered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          url: string
          secret: string
          events: string[]
          is_active?: boolean
          consecutive_failures?: number
          last_triggered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          url?: string
          secret?: string
          events?: string[]
          is_active?: boolean
          consecutive_failures?: number
          last_triggered_at?: string | null
          created_at?: string
        }
      }
      abuse_reports: {
        Row: {
          id: string
          link_id: string
          reporter_ip: string
          reporter_email: string | null
          reason: 'phishing' | 'malware' | 'spam' | 'inappropriate' | 'other'
          description: string | null
          status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_notes: string | null
          created_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          link_id: string
          reporter_ip: string
          reporter_email?: string | null
          reason: 'phishing' | 'malware' | 'spam' | 'inappropriate' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          link_id?: string
          reporter_ip?: string
          reporter_email?: string | null
          reason?: 'phishing' | 'malware' | 'spam' | 'inappropriate' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          changes: Json | null
          ip_address: string
          user_agent: string | null
          correlation_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          changes?: Json | null
          ip_address: string
          user_agent?: string | null
          correlation_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          changes?: Json | null
          ip_address?: string
          user_agent?: string | null
          correlation_id?: string
          created_at?: string
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
      user_role: 'user' | 'admin'
      redirect_type: '301' | '302'
      abuse_reason: 'phishing' | 'malware' | 'spam' | 'inappropriate' | 'other'
      abuse_status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
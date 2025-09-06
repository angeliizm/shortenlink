interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

interface User {
  id: number
  email: string
  created_at: string
  updated_at: string
}

interface AuthData {
  user: User
  access_token: string
  expires_at: number
}

class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

class ApiClient {
  private baseURL: string
  private refreshing: boolean = false
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get access token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    })

    // If we get a 401 and we have a token, try to refresh
    if (response.status === 401 && token && !this.refreshing && !endpoint.includes('/auth/refresh')) {
      try {
        const newToken = await this.refreshToken()
        
        // Retry the original request with the new token
        headers.Authorization = `Bearer ${newToken}`
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        })
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        throw new ApiError('Session expired', 401)
      }
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || `HTTP ${response.status}`, response.status)
    }

    return data
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.refreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiError('Refresh failed', response.status)
    }

    const data = await response.json()
    
    if (!data.success || !data.data?.access_token) {
      throw new ApiError('Invalid refresh response', 401)
    }

    // Update the stored token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.data.access_token)
    }

    return data.data.access_token
  }

  // Auth endpoints
  auth = {
    register: async (email: string, password: string): Promise<ApiResponse<AuthData>> => {
      return this.request<AuthData>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    login: async (email: string, password: string): Promise<ApiResponse<AuthData>> => {
      return this.request<AuthData>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    refresh: async (): Promise<ApiResponse<{ access_token: string; expires_at: number }>> => {
      return this.request('/api/auth/refresh', {
        method: 'POST',
      })
    },

    logout: async (): Promise<ApiResponse> => {
      return this.request('/api/auth/logout', {
        method: 'POST',
      })
    },

    me: async (): Promise<ApiResponse<User>> => {
      return this.request<User>('/api/auth/me')
    },
  }

  // Generic methods for other endpoints
  get = <T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post = <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> => {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put = <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> => {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete = <T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient()
export { ApiError }
export type { ApiResponse, User, AuthData }
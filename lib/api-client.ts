interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

class ApiClient {
  private baseUrl: string
  private getAccessToken: () => string | null
  private refreshToken: () => Promise<boolean>

  constructor(
    baseUrl: string = '',
    getAccessToken: () => string | null,
    refreshToken: () => Promise<boolean>
  ) {
    this.baseUrl = baseUrl
    this.getAccessToken = getAccessToken
    this.refreshToken = refreshToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options
    
    // Add auth header if token exists and not skipped
    const token = this.getAccessToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }
    
    if (token && !skipAuth) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
    }

    let response = await fetch(`${this.baseUrl}${endpoint}`, config)

    // If 401, try to refresh token and retry once
    if (response.status === 401 && !skipAuth) {
      const refreshSuccess = await this.refreshToken()
      
      if (refreshSuccess) {
        // Retry with new token
        const newToken = this.getAccessToken()
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...config,
            headers,
          })
        }
      }
    }

    // Handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Request failed: ${response.statusText}`)
    }

    // Return JSON response
    return response.json()
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create singleton instance
let apiClientInstance: ApiClient | null = null

export function initializeApiClient(
  getAccessToken: () => string | null,
  refreshToken: () => Promise<boolean>
): ApiClient {
  apiClientInstance = new ApiClient('', getAccessToken, refreshToken)
  return apiClientInstance
}

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    throw new Error('API Client not initialized. Call initializeApiClient first.')
  }
  return apiClientInstance
}

export default ApiClient
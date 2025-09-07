const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

interface FetchOptions extends RequestInit {
  skipRefresh?: boolean
}

export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options
  
  const url = `${API_BASE_URL}${path}`
  
  // Get access token from cookie if available
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('access='))
    ?.split('=')[1]
  
  const config: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...fetchOptions.headers,
    },
  }

  let response = await fetch(url, config)

  // If 401 and not already trying refresh, attempt to refresh token
  if (response.status === 401 && !skipRefresh) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshResponse.ok) {
      // Retry original request
      response = await fetch(url, config)
    }
  }

  return response
}

export async function getMe(): Promise<{ user_id: string; email: string; role: string } | null> {
  try {
    const response = await apiFetch('/me')
    
    if (response.ok) {
      return await response.json()
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}
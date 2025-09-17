import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export async function loginAdmin(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      // Try to get error message from response
      let errorMessage = 'Login failed'
      try {
        const errorData = await res.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        errorMessage = `Login failed with status: ${res.status}`
      }
      throw new Error(errorMessage)
    }

    const data = await res.json()

    // Store token in cookies
    Cookies.set('admin_token', data.token, { expires: 7 }) 
    return data
  } catch (error) {
    console.error('Login API error:', error)
    throw error
  }
}

// Add the missing checkAuth function
export async function checkAuth() {
  const token = getAuthToken()
  if (!token) {
    console.log('No auth token found')
    return null
  }

  try {
    const res = await fetch(`${API_URL}/admin/check-auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.log('Auth check failed with status:', res.status)
      return null
    }

    return await res.json()
  } catch (error) {
    console.error('Auth check error:', error)
    return null
  }
}

export function getAuthToken() {
  return Cookies.get('admin_token')
}

export function logoutAdmin() {
  Cookies.remove('admin_token')
  console.log('Admin logged out')
}
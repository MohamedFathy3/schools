import Cookies from 'js-cookie'

const GATEWAY_URL = '/api'

export interface Teacher {
  id: number
  name: string
  email: string
  role?: string
}

export interface LoginResponse {
  result: string
  data: null
  message: {
    message: string
    token: string
    teacher: Teacher
  }
  status: number
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${GATEWAY_URL}/${endpoint}`
  
  console.log(`🚀 [API] ${options.method || 'GET'} ${endpoint}`)
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  console.log(`📨 [API] Response: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  return response.json()
}

export const teacherApi = {
  // ✅ تسجيل الدخول
  async login(email: string, password: string): Promise<{ teacher: Teacher; token: string }> {
    try {
      console.log('🔐 Attempting login...')

      const data: LoginResponse = await apiRequest('teachers/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      console.log('✅ Login successful')

      // تخزين البيانات
      Cookies.set('teacher_token', data.message.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      localStorage.setItem('teacher_user', JSON.stringify(data.message.teacher))

      return {
        teacher: data.message.teacher,
        token: data.message.token
      }
    } catch (error) {
      console.error('🔥 Login error:', error)
      throw error
    }
  },

  // ✅ التحقق من الجلسة
  async checkAuth(): Promise<Teacher | null> {
    try {
      const savedUser = localStorage.getItem('teacher_user')
      const token = Cookies.get('teacher_token')

      if (!token || !savedUser) {
        return null
      }

      // جرب endpoints مختلفة
      const endpoints = [
        'teachers/profile',
        'teachers/me', 
        'user/profile'
      ]

      for (const endpoint of endpoints) {
        try {
          await apiRequest(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          return JSON.parse(savedUser)
        } catch {
          continue
        }
      }

      return JSON.parse(savedUser)
    } catch (error) {
      console.error('Auth check error:', error)
      return null
    }
  },

  // ✅ جلب البروفايل
  async getProfile(): Promise<Teacher | null> {
    const token = Cookies.get('teacher_token')
    if (!token) return null

    try {
      const data = await apiRequest('teachers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const teacher = data.message?.teacher || data.teacher || data
      if (teacher) {
        localStorage.setItem('teacher_user', JSON.stringify(teacher))
      }
      
      return teacher
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  },

  // ✅ تسجيل الخروج
  async logout(): Promise<void> {
    const token = Cookies.get('teacher_token')
    
    try {
      if (token) {
        await apiRequest('teachers/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      this.clearAuthData()
    }
  },

  // ✅ مسح البيانات
  clearAuthData(): void {
    Cookies.remove('teacher_token')
    localStorage.removeItem('teacher_user')
  },

  // ✅ الدروس
  async getCourses(): Promise<any> {
    const token = Cookies.get('teacher_token')
    if (!token) return null

    try {
      return await apiRequest('teachers/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Get courses error:', error)
      return null
    }
  }
}
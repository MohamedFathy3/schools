import Cookies from 'js-cookie'

const GATEWAY_URL = '/api'

export interface Teacher {
  id: number
  name: string
  email: string
  role?: string
  active?: boolean
  type?: string
  total_rate?: number
  phone?: string
  national_id?: string
  image?: string
  certificate_image?: string
  experience_image?: string
  country?: {
    id: number
    name: string
    key: string
    code: string
    active: boolean
    image: string
    orderId: number | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    deleted: boolean
  }
  stage?: {
    id: number
    name: string
    postion: number
    active: boolean
    image: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    country?: any
  }
  subject?: {
    id: number
    name: string
    postion: number
    active: boolean
    image: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stage?: any
  }
  account_holder_name?: string
  account_number?: string
  iban?: string
  swift_code?: string
  branch_name?: string
  wallets_name?: string
  wallets_number?: string
  commission?: string
  courses_count?: number
  students_count?: number
  total_income?: number
  courses?: Array<{
    course_name: string
    students_count: number
    course_income: number
    teacher_share: number
  }>
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

      // تخزين البيانات في Cookies فقط
      Cookies.set('teacher_token', data.message.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      // تخزين بيانات المستخدم في Cookies بدلاً من localStorage
      Cookies.set('teacher_user', JSON.stringify(data.message.teacher), { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

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
      const savedUser = Cookies.get('teacher_user')
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
        // تحديث بيانات المستخدم في Cookies
        Cookies.set('teacher_user', JSON.stringify(teacher), { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
      
      return teacher
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  },

  // ✅ تحديث الملف الشخصي - أضف هذه الدالة
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateProfile(formData: FormData): Promise<any> {
    const token = Cookies.get('teacher_token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    try {
      console.log('🔄 Attempting to update profile...')

      // استخدام fetch مباشرة لأن apiRequest تستخدم JSON فقط
      const response = await fetch(`${GATEWAY_URL}/teachers/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // لا تضيف Content-Type هنا لأن FormData يضيفها تلقائياً مع boundary
        },
        body: formData
      })

      console.log(`📨 [API] Update Profile Response: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Profile update successful')

      // تحديث بيانات المستخدم في Cookies إذا كانت موجودة في الرد
      if (data.teacher || data.message?.teacher) {
        const updatedTeacher = data.teacher || data.message.teacher
        Cookies.set('teacher_user', JSON.stringify(updatedTeacher), { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }

      return data
    } catch (error) {
      console.error('🔥 Profile update error:', error)
      throw error
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
    Cookies.remove('teacher_user')
  },

  // ✅ الدروس
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
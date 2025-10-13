import Cookies from 'js-cookie'

const GATEWAY_URL = '/api'

export interface Teacher {
  id: number
  name: string
  email: string
  role?: string
  image?: string
  phone?: string
  national_id?: string
  
  // العلاقات
  country?: {
    id: number
    name: string
  }
  stage?: {
    id: number
    name: string
  }
  subject?: {
    id: number
    name: string
  }
  
  // الحقول الأساسية
  country_id?: number
  stage_id?: number
  subject_id?: number
  
  // البيانات الإضافية
  secound_email?: string
  teacher_type?: string
  total_rate?: number
  commission?: string
  courses_count?: number
  students_count?: number
  total_income?: number
  rewards?: string
  average_rating?: number
  
  // المعلومات البنكية
  account_holder_name?: string
  account_number?: string
  bank_name?: string
  bank_branch?: string
  branch_name?: string
  iban?: string
  swift_code?: string
  
  // المحافظ الإلكترونية
  wallets_name?: string
  wallets_number?: string
  
  // الصور
  certificate_image?: string
  experience_image?: string
  id_card_front?: string
  id_card_back?: string
  
  // التحويل البريدى
  postal_transfer_full_name?: string
  postal_transfer_office_address?: string
  postal_transfer_recipient_name?: string
  postal_transfer_recipient_phone?: string
  
  // حالة الحساب
  active?: boolean
  type?: string
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


   async updateProfile(formData: FormData): Promise<{ success: boolean; message?: string }> {
    const token = Cookies.get('teacher_token')
    if (!token) {
      throw new Error('No authentication token')
    }

    try {
      const response = await fetch(`${GATEWAY_URL}/teachers/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // لا تضيف Content-Type هنا لأن FormData يضيفها تلقائياً
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || 'فشل في التحديث' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'حدث خطأ أثناء التحديث' }
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
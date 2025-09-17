// lib/adminApi.ts
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

// أنواع البيانات
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

export const teacherApi = {
  // ✅ تسجيل الدخول
  async login(email: string, password: string): Promise<{ teacher: Teacher }> {
    try {
      const res = await fetch(`${API_URL}/teachers/login`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        let errorMessage = 'Login failed'
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `Login failed with status: ${res.status}`
        }
        console.error('❌ Login failed:', errorMessage)
        throw new Error(errorMessage)
      }

      const data: LoginResponse = await res.json()

      // ✅ طباعة الـ token في console
      console.log('✅ Token received:', data.message.token)

      // ✅ تخزين الـ token في الكوكيز
      Cookies.set('teacher_token', data.message.token, { expires: 7 })
      console.log('✅ Token saved in cookie!')

      // ✅ طباعة بيانات المدرس
      console.log('👨‍🏫 Teacher Info:', data.message.teacher)

      return {
        teacher: data.message.teacher,
      }
    } catch (error) {
      console.error('🔥 Login error:', error)
      throw error
    }
  },

  // ✅ التحقق من الجلسة
async checkAuth(): Promise<Teacher | null> {
  const token = Cookies.get('teacher_token')
  console.log('🔍 Checking auth with token:', token)

  if (!token) {
    console.warn('⚠️ No token found in cookies.')
    return null
  }

  try {
    const res = await fetch(`${API_URL}/teachers/check-auth`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      console.warn('❌ Auth check failed with status:', res.status)
      return null
    }

    const data = await res.json()
    console.log('✅ Auth check success:', data)

    // ✅ عدل هنا 👇
    return data.message?.teacher || null
  } catch (err) {
    console.error('❌ Error checking auth:', err)
    return null
  }
}
,

  // ✅ تسجيل الخروج
  logout() {
    Cookies.remove('teacher_token')
    console.log('🚪 Logged out and token removed from cookies.')
  },

  // ✅ جلب البروفايل
  async getProfile(): Promise<Teacher | null> {
    const token = Cookies.get('teacher_token')
    console.log('👤 Getting profile with token:', token)

    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/teachers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null

      const data = await res.json()
      console.log('📄 Profile data:', data)

      return data
    } catch (err) {
      console.error('❌ Error getting profile:', err)
      return null
    }
  },

  // ✅ تحديث البروفايل
  async updateProfile(data: Partial<Teacher>): Promise<Teacher | null> {
    const token = Cookies.get('teacher_token')
    console.log('🛠️ Updating profile with token:', token)

    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/teachers/update-profile`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) return null

      const updated = await res.json()
      console.log('✅ Profile updated:', updated)

      return updated
    } catch (err) {
      console.error('❌ Error updating profile:', err)
      return null
    }
  },
}

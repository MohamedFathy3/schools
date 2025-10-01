// lib/adminApi.ts
import Cookies from 'js-cookie'

const API_URL = '/api'

// أنواع البيانات
export interface Admin {
  id: number
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface LoginResponse {
  token: string
  admin: Admin
}


await fetch(`${API_URL}/sanctum/csrf-cookie`, {
  credentials: 'include'
})



export const adminApi = {
  // تسجيل الدخول
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
        credentials: 'include',

      body: JSON.stringify({ email, password }),
      // ❌ شلنا credentials لأنه يسبب CSRF error مع JWT
    })

    if (!res.ok) {
      let errorMessage = 'Login failed'
      try {
        const errorData = await res.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `Login failed with status: ${res.status}`
      }
      throw new Error(errorMessage)
    }

    const data: LoginResponse = await res.json()
    // تخزين الـ token في الكوكيز
    Cookies.set('admin_token', data.token, { expires: 7 })
    return data
  },

  // التحقق من السيشن
  async checkAuth(): Promise<Admin | null> {
    const token = Cookies.get('admin_token')
    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/admin/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.admin || null
    } catch {
      return null
    }
  },

  // تسجيل الخروج
  logout() {
    Cookies.remove('admin_token')
  },

  // جلب البروفايل
  async getProfile(): Promise<Admin | null> {
    const token = Cookies.get('admin_token')
    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  // تحديث البروفايل
  async updateProfile(data: Partial<Admin>): Promise<Admin | null> {
    const token = Cookies.get('admin_token')
    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },
}

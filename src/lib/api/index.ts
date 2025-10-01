// eslint-disable-next-line @typescript-eslint/no-explicit-any

import Cookies from 'js-cookie'

const API_URL = '/api'; // بدل ما تستخدم https://back.professionalacademyedu.com/api مباشرة

// أنواع البيانات
export interface Admin {
  id: number
  name: string
  email: string
  password: string
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  token: string
  admin: Admin
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// دالة HTTP أساسية
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`
  const token = Cookies.get('admin_token')

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  try {
    const response = await fetch(url, {
      headers: defaultHeaders,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error)
    return {
      success: false,
      message: error.message || 'حدث خطأ في الاتصال بالخادم',
      error: error.message
    }
  }
}

// خدمات API للإدارة
export const adminApi = {
  // تسجيل الدخول
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return fetchApi<LoginResponse>('/admin/login', {
      method: 'POST',
 
      body: JSON.stringify({ email, password }),
    })
  },

  checkAuth: async (): Promise<ApiResponse<{ admin: Admin }>> => {
    return fetchApi<{ admin: Admin }>('/admin/check-auth', {
      method: 'GET',
    })
  },

  // تسجيل الخروج
  logout: async (): Promise<ApiResponse<void>> => {
    Cookies.remove('admin_token')
    return { success: true }
  },

  // الحصول على بيانات الأدمن
  getProfile: async (): Promise<ApiResponse<Admin>> => {
    return fetchApi<Admin>('/admin/profile', {
      method: 'GET',
    })
  },

  // تحديث بيانات الأدمن
  updateProfile: async (data: Partial<Admin>): Promise<ApiResponse<Admin>> => {
    return fetchApi<Admin>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

// خدمات أخرى يمكن إضافتها لاحقاً
export const coursesApi = {
  // سأضيفها لاحقاً
}

export const studentsApi = {
  // سأضيفها لاحقاً
}

export const teachersApi = {
  // سأضيفها لاحقاً
}

// دالة مساعدة للتحقق من اتصال الخادم
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'OPTIONS',
    })
    return response.status !== 0 && !response.type.includes('error')
  } catch (error) {
    console.error('Server connection check failed:', error)
    return false
  }
}

// دالة للحصول على التوكن
export const getAuthToken = (): string | undefined => {
  return Cookies.get('admin_token')
}

// دالة لحفظ التوكن
export const setAuthToken = (token: string): void => {
  Cookies.set('admin_token', token, { expires: 7 })
}
import Cookies from 'js-cookie'

const GATEWAY_URL = '/api'

export interface Course {
  id: number
  title: string
  description: string
  type: string
  price: string
  discount: string
  original_price: string
  image: string
  views_count: number
  subscribers_count: number
  active: boolean
  content_link: string
  intro_video_url: string
  teacher: {
    id: number
    name: string
    image: string
  }
  stage: {
    id: number
    name: string
  }
  subject: {
    id: number
    name: string
  }
  country: {
    id: number
    name: string
  }
  details: Array<{
    id: number
    title: string
    content_type: string
  }>
}

export interface CoursesResponse {
  data: Course[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${GATEWAY_URL}/${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  return response.json()
}

export const courseApi = {
  // ✅ جلب الكورسات مع Pagination
  async getCourses(page: number = 1, perPage: number = 5): Promise<CoursesResponse> {
    try {
      const data = await apiRequest('course/index', {
        method: 'POST',
        body: JSON.stringify({
          filters: {},
          orderBy: "id",
          orderByDirection: "desc",
          perPage: perPage,
          page: page,
          paginate: true,
          delete: false
        })
      })
      
      return {
        data: data.data || [],
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || perPage,
        total: data.total || 0
      }
    } catch (error) {
      console.error('Get courses error:', error)
      throw error
    }
  },

  // ✅ تبديل حالة الكورس (active/inactive)
  async toggleActive(courseId: number, active: boolean): Promise<boolean> {
    try {
      const token = Cookies.get('admin_token') || Cookies.get('teacher_token') || ''
      
      const data = await apiRequest(`course/${courseId}/active`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active })
      })
      
      return data.status === 200 || data.success
    } catch (error) {
      console.error('Toggle active error:', error)
      throw error
    }
  },

  // ✅ جلب تفاصيل الكورس
  async getCourseDetails(courseId: number): Promise<Course> {
    try {
      const data = await apiRequest(`course/show/${courseId}`)
      return data.data || data
    } catch (error) {
      console.error('Get course details error:', error)
      throw error
    }
  }
}
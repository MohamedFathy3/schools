// eslint-disable-next-line @typescript-eslint/no-explicit-any


const API_URL = '/api'; // بدل ما تستخدم https://back.professionalacademyedu.com/api مباشرة

export interface stage {
  id: number
  name: string
  country: {id:number, name:string}
  active: boolean
  image: string
  postion: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deleted: boolean
}

export interface stageResponse {
  data: stage[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path: string
    per_page: number
    to: number
    total: number
  }
  result: string
  message: string
  status: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// دالة أساسية للاتصال بالـ API (بدون توكن)
async function fetchPublicApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  try {
    const response = await fetch(url, {
      headers,
      credentials: 'omit',
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
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

// خدمات API للدول
export const countryApi = {
  // الحصول على قائمة الدول مع إمكانية التحكم في Pagination
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCountries: async (page: number = 1, perPage: number = 10, filters: any = {}): Promise<ApiResponse<stageResponse>> => {
    const requestBody = {
      filters,
      orderBy: "id",
      orderByDirection: "asc",
      perPage,
      paginate: true,
      delete: false
    }

    return fetchPublicApi<stageResponse>(`/stage/index?page=${page}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
  },

  // تفعيل/إلغاء تفعيل دولة
  toggleActive: async (countryId: number): Promise<ApiResponse<stage>> => {
    return fetchPublicApi<stage>(`/stage/${countryId}/active`, {
      method: 'PUT',
    })
  },

  // الحصول على دولة بواسطة ID
  getCountry: async (countryId: number): Promise<ApiResponse<stage>> => {
    return fetchPublicApi<stage>(`/country/${countryId}`)
  },

  // إنشاء دولة جديدة
  createCountry: async (countryData: Partial<stage>): Promise<ApiResponse<stage>> => {
    return fetchPublicApi<stage>('/stage', {
      method: 'POST',
      body: JSON.stringify(countryData),
    })
  },

  // تحديث دولة
  updateCountry: async (countryId: number, countryData: Partial<stage>): Promise<ApiResponse<stage>> => {
    return fetchPublicApi<stage>(`/stage/update/${countryId}`, {
      method: 'POST',
      body: JSON.stringify(countryData),
    })
  },

  // حذف دولة
  deleteCountry: async (countryId: number): Promise<ApiResponse<void>> => {
    return fetchPublicApi<void>(`/stage/delete`, {
      method: 'DELETE',
    })
  }
}



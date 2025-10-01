// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import React, { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiVideo, FiFileText, FiDollarSign, FiUsers, FiBook, FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'
import Link from 'next/link'

interface Course {
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
  what_you_will_learn: string
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
}

declare global {
  interface Error {
    errors?: { [key: string]: string[] };
  }
}

type UpdateCoursePayload = {
  title: string
  description: string
  stage_id: string
  subject_id: string
  country_id: string
  type: string
  price: string
  discount: string
  original_price: string
  what_you_will_learn: string
  intro_video_url: string
  image?: File | null
}

const CourseModal = ({
  course,
  isOpen,
  onClose,
  onUpdate
}: {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (courseId: number, data: UpdateCoursePayload) => Promise<void>
}) => {
  const [formData, setFormData] = useState<UpdateCoursePayload>({
    title: '',
    description: '',
    stage_id: '',
    subject_id: '',
    country_id: '',
    type: '',
    price: '',
    discount: '',
    original_price: '',
    what_you_will_learn: '',
    intro_video_url: '',
    image: null
  })

  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        stage_id: course.stage?.id.toString(),
        subject_id: course.subject.id.toString(),
        country_id: course.country.id.toString(),
        type: course.type || '',
        price: course.price || '',
        discount: course.discount || '',
        original_price: course.original_price || '',
        what_you_will_learn: course.what_you_will_learn || '',
        intro_video_url: course.intro_video_url || '',
        image: null
      })
      setErrors({})
    }
  }, [course])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return

    setErrors({})

    try {
      await onUpdate(course.id, formData)
      onClose()
    } 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors)
        toast.error('هناك بعض الأخطاء في البيانات')
      } else {
        toast.error(err.message || 'حدث خطأ أثناء التحديث')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">تعديل الكورس</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">عنوان الكورس</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                required
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">السعر الأصلي</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                required
              />
              {errors.original_price && (
                <p className="text-red-400 text-sm mt-1">{errors.original_price.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">السعر الحالي</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                required
              />
              {errors.price && (
                <p className="text-red-400 text-sm mt-1">{errors.price.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">النوع</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                required
              >
                <option value="">اختر النوع</option>
                <option value="online">online</option>
                <option value="recorded">recorded</option>
              </select>
              {errors.type && (
                <p className="text-red-400 text-sm mt-1">{errors.type.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                required
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">ماذا سوف تتعلم</label>
              <textarea
                name="what_you_will_learn"
                value={formData.what_you_will_learn}
                onChange={handleChange}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">رابط الفيديو التعريفي</label>
              <input
                type="url"
                name="intro_video_url"
                value={formData.intro_video_url}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">صورة الكورس</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl"
            >
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-xl"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stages, setStages] = useState<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subjects, setSubjects] = useState<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    stage: '',
    subject: '',
    country: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minSubscribers: '',
    maxSubscribers: ''
  })

  const API_URL = '/api'; // بدل ما تستخدم https://back.professionalacademyedu.com/api مباشرة

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/course/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: { "teacher_id": Cookies.get('teacher_id') || '' },
          orderBy: "id",
          orderByDirection: "asc",
          perPage: 100,
          paginate: true,
          delete: false
        })
        
        
      })
      const data = await res.json()
      if (data.status === 200) {
        setCourses(data.data || [])
      }
    } catch (err) {
      toast.error('حدث خطأ في تحميل الكورسات')
    } finally {
      setLoading(false)
    }
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCourse = async (courseId: number, formData: any) => {
    try {
      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'image' && formData[key] instanceof File) {
            payload.append(key, formData[key])
          } else {
            payload.append(key, formData[key].toString())
          }
        }
      })
      
      const token = Cookies.get('teacher_token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً')
        return
      }
      
      const res = await fetch(`${API_URL}/course/update/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (data.errors) {
          const error = new Error(data.message || 'فشل في التحديث')
          error.errors = data.errors
          throw error
        }
        throw new Error(data.message || 'فشل في التحديث')
      }
      
      if (data.status === 200 || data.success) {
        toast.success('تم التحديث بنجاح')
        fetchCourses()
        setIsModalOpen(false)
        return
      }
      
      throw new Error(data.message || 'فشل في التحديث')
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchCourses()
    
    // Fetch stages, subjects, and countries
    const fetchInitialData = async () => {
      try {
        const token = Cookies.get('teacher_token')
        if (!token) return
        
        // You'll need to implement these API calls based on your backend
        // const stagesRes = await fetch(`${API_URL}/stages`, { headers: { Authorization: `Bearer ${token}` } })
        // const subjectsRes = await fetch(`${API_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } })
        // const countriesRes = await fetch(`${API_URL}/countries`, { headers: { Authorization: `Bearer ${token}` } })
        
        // setStages(await stagesRes.json())
        // setSubjects(await subjectsRes.json())
        // setCountries(await countriesRes.json())
      } catch (err) {
        console.error('Error fetching initial data:', err)
      }
    }
    
    fetchInitialData()
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = !filters.stage || course.stage.id.toString() === filters.stage
    const matchesSubject = !filters.subject || course.subject.id.toString() === filters.subject
    const matchesCountry = !filters.country || course.country.id.toString() === filters.country
    const matchesType = !filters.type || course.type === filters.type
    const matchesMinPrice = !filters.minPrice || parseFloat(course.price) >= parseFloat(filters.minPrice)
    const matchesMaxPrice = !filters.maxPrice || parseFloat(course.price) <= parseFloat(filters.maxPrice)
    const matchesMinSubscribers = !filters.minSubscribers || course.subscribers_count >= parseInt(filters.minSubscribers)
    const matchesMaxSubscribers = !filters.maxSubscribers || course.subscribers_count <= parseInt(filters.maxSubscribers)
    
    return matchesSearch && matchesStage && matchesSubject && matchesCountry && 
           matchesType && matchesMinPrice && matchesMaxPrice && 
           matchesMinSubscribers && matchesMaxSubscribers
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      stage: '',
      subject: '',
      country: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minSubscribers: '',
      maxSubscribers: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-white">جار التحميل...</div>
        </div>
      </Layout>
    )
  }


  const handleDeleteCourse = async (courseId: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا الكورس؟')) return

  try {
    const token = Cookies.get('teacher_token')
    if (!token) {
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }

    const res = await fetch(`${API_URL}/course/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [courseId]
      })
    })

    const data = await res.json()

    if (res.ok && (data.status === 200 || data.message?.includes("success"))) {
      toast.success('تم حذف الكورس بنجاح')
      fetchCourses()
    } else {
      toast.error(data.message || 'فشل في حذف الكورس')
    }
  } catch (err) {
    toast.error('حدث خطأ أثناء الحذف')
  }
}

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen">
        <ToastContainer />
        
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">إدارة الكورسات</h1>
          
          <div className="flex gap-4 flex-wrap">
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن كورس، معلم، أو مادة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg pl-10"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center ${showFilters ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
            >
              <FiFilter className="ml-2" /> فلاتر
              {hasActiveFilters && (
                <span className="mr-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
              >
                Card
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
              >
                Table
              </button>
            </div>
            
          
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-700 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">فلاتر البحث</h2>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-gray-300 hover:text-white flex items-center"
                  >
                    <FiX className="ml-1" /> إعادة الضبط
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">المرحلة الدراسية</label>
                <select
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                >
                  <option value="">جميع المراحل</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">المادة</label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                >
                  <option value="">جميع المواد</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">البلد</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                >
                  <option value="">جميع البلدان</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">نوع الكورس</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="free">مجاني</option>
                  <option value="paid">مدفوع</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أقل سعر</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أعلى سعر</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                  placeholder="أي سعر"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أقل عدد مشتركين</label>
                <input
                  type="number"
                  value={filters.minSubscribers}
                  onChange={(e) => handleFilterChange('minSubscribers', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أعلى عدد مشتركين</label>
                <input
                  type="number"
                  value={filters.maxSubscribers}
                  onChange={(e) => handleFilterChange('maxSubscribers', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                  placeholder="أي عدد"
                />
              </div>
            </div>
          </div>
        )}

        {filteredCourses.length === 0 ? (
          <div className="bg-gray-700 rounded-2xl p-8 text-center">
            <p className="text-gray-300">لا توجد كورسات </p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${course.type === 'free' ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                      {course.type === 'free' ? 'مجاني' : 'مدفوع'}
                    </span>
                    <div className="flex items-center text-yellow-400">
                      <FiDollarSign />
                      <span className="ml-1">{course.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <div className="flex items-center">
                      <FiUsers className="ml-1" />
                      <span>{course.subscribers_count}</span>
                    </div>
                    <div className="flex items-center">
                      <FiEye className="ml-1" />
                      <span>{course.views_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <img src={course.teacher.image} alt={course.teacher.name} className="w-8 h-8 rounded-full" />
                    <span className="text-sm">{course.teacher.name}</span>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => {
                        setEditingCourse(course)
                        setIsModalOpen(true)
                      }}
                      className="bg-yellow-600 text-white p-2 rounded-lg"
                      title="تعديل"
                    >
                      <FiEdit />
                    </button>
                    <button className="bg-red-600 text-white p-2 rounded-lg" title="حذف">
                      <FiTrash2 />
                    </button>
                    <Link href={`/teacher/courses/${course.id}`}>
                      <button 
                        className="bg-green-600 text-white p-2 rounded-lg" 
                        title="عرض التفاصيل"
                      >
                        <FiEye />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-600">
                <tr>
                  <th className="p-4 text-center">الكورس</th>
                  <th className="p-4 text-center">المعلم</th>
                  <th className="p-4 text-center">المادة</th>
                  <th className="p-4 text-center">المرحلة</th>
                  <th className="p-4 text-center">السعر</th>
                  <th className="p-4 text-center">المشتركين</th>
                  <th className="p-4 text-center">المشاهدات</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-t text-center border-gray-600 hover:bg-gray-600">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-semibold">{course.title}</div>
                          <div className="text-sm text-gray-300">{course.type === 'online' ? 'online' : 'recorded'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        {course.teacher.name}
                      </div>
                    </td>
                    <td className="p-4">{course.subject.name}</td>
                    <td className="p-4">{course.stage?.name}</td>
                    <td className="p-4">
                      <div className="flex items-center text-yellow-400">
                        <FiDollarSign />
                        <span className="ml-1">{course.price}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <FiUsers className="ml-1" />
                        {course.subscribers_count}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <FiEye className="ml-1" />
                        {course.views_count}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingCourse(course)
                            setIsModalOpen(true)
                          }}
                          className="bg-yellow-600 text-white p-2 rounded-lg"
                          title="تعديل"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}

                        className="bg-red-600 text-white p-2 rounded-lg" title="حذف">
                          <FiTrash2 />
                        </button>
                        <Link href={`/teacher/courses/${course.id}`}>
                          <button 
                            className="bg-green-600 text-white p-2 rounded-lg" 
                            title="عرض التفاصيل"
                          >
                            <FiEye />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <CourseModal
          course={editingCourse}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={updateCourse}
        />
      </div>
    </Layout>
  )
}
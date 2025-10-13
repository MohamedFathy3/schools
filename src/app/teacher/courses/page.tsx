'use client'
import React, { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiVideo, FiFileText, FiDollarSign, FiUsers, FiBook, FiFilter, FiChevronDown, FiChevronUp, FiX, FiImage } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'
import Link from 'next/link'
import {useTeacherAuth} from '@/contexts/teacherAuthContext'

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
  onUpdate,
  stages,
  subjects,
  countries
}: {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (courseId: number, data: UpdateCoursePayload) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stages: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subjects: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countries: any[]
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
        stage_id: course.stage?.id?.toString() || '',
        subject_id: course.subject?.id?.toString() || '',
        country_id: course.country?.id?.toString() || '',
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">تعديل الكورس</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">عنوان الكورس</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">السعر الأصلي</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              {errors.original_price && (
                <p className="text-red-500 text-sm mt-1">{errors.original_price.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">السعر الحالي</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">الخصم (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              {errors.discount && (
                <p className="text-red-500 text-sm mt-1">{errors.discount.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">النوع</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">اختر النوع</option>
                <option value="online">اونلاين</option>
                <option value="recorded">مسجل</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">المرحلة</label>
              <select
                name="stage_id"
                value={formData.stage_id}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">اختر المرحلة</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              {errors.stage_id && (
                <p className="text-red-500 text-sm mt-1">{errors.stage_id.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">المادة</label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">اختر المادة</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subject_id && (
                <p className="text-red-500 text-sm mt-1">{errors.subject_id.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">البلد</label>
              <select
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">اختر البلد</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country_id && (
                <p className="text-red-500 text-sm mt-1">{errors.country_id.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">ماذا سوف تتعلم</label>
              <textarea
                name="what_you_will_learn"
                value={formData.what_you_will_learn}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="اكتب ما سيتعلمه الطلاب في هذا الكورس..."
              />
              {errors.what_you_will_learn && (
                <p className="text-red-500 text-sm mt-1">{errors.what_you_will_learn.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">رابط الفيديو التعريفي</label>
              <input
                type="url"
                name="intro_video_url"
                value={formData.intro_video_url}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="https://youtube.com/..."
              />
              {errors.intro_video_url && (
                <p className="text-red-500 text-sm mt-1">{errors.intro_video_url.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">صورة الكورس</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {course?.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                    <img 
                      src={course.image} 
                      alt="صورة الكورس الحالية" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image.join(', ')}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <FiEdit />
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-xl font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stages, setStages] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subjects, setSubjects] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useTeacherAuth()
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

  const API_URL = '/api'; 

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchData = async (endpoint: string, body: any = {}) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          filters: {},
          orderBy: "id",
          orderByDirection: "asc",
          perPage: 100,
          paginate: true,
          delete: false
        }),
      });

      const data = await res.json();
      if (data.status === 200) {
        return data.data || [];
      } else {
        throw new Error(data.message || "فشل في جلب البيانات");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء جلب البيانات");
      return [];
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [stagesData, countriesData, subjectsData] = await Promise.all([
        fetchData("stage/index"),
        fetchData("country/index"),
        fetchData("subject/index"),
      ]);

      console.log('Stages:', stagesData);
      console.log('Countries:', countriesData);
      console.log('Subjects:', subjectsData);

      return { stages: stagesData, countries: countriesData, subjects: subjectsData };
    } catch (err) {
      toast.error("تعذر تحميل البيانات");
      return { stages: [], countries: [], subjects: [] };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const { stages, countries, subjects } = await fetchAllData();
      setStages(stages);
      setCountries(countries);
      setSubjects(subjects);
    };
    load();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/course/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: { "teacher_id": user?.id || '' },
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

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-white min-h-screen flex items-center justify-center">
          <div className="text-gray-600">جار التحميل...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <ToastContainer />
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة الكورسات</h1>
              <p className="text-gray-600">إدارة وعرض جميع الكورسات الخاصة بك</p>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن كورس، معلم، أو مادة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-800 p-3 rounded-xl pl-12 w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  showFilters 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                }`}
              >
                <FiFilter /> 
                فلاتر
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === 'card' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiImage size={16} />
                  Card
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiFileText size={16} />
                  Table
                </button>
              </div>

              <Link href="/teacher/courses/create">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
                  <FiPlus />
                  إنشاء كورس جديد
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">فلاتر البحث</h2>
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 transition-colors"
                  >
                    <FiX size={16} />
                    إعادة الضبط
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">المرحلة الدراسية</label>
                <select
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">جميع المراحل</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">المادة</label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">جميع المواد</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">البلد</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">جميع البلدان</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">نوع الكورس</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="online">اونلاين</option>
                  <option value="recorded">مسجل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">أقل سعر</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">أعلى سعر</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أي سعر"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">أقل عدد مشتركين</label>
                <input
                  type="number"
                  value={filters.minSubscribers}
                  onChange={(e) => handleFilterChange('minSubscribers', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">أعلى عدد مشتركين</label>
                <input
                  type="number"
                  value={filters.maxSubscribers}
                  onChange={(e) => handleFilterChange('maxSubscribers', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أي عدد"
                />
              </div>
            </div>
          </div>
        )}

        {/* Courses Content */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBook size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد كورسات</h3>
              <p className="text-gray-600 mb-6">لم تقم بإنشاء أي كورسات بعد أو لا توجد كورسات تطابق معايير البحث</p>
              <Link href="/teacher/courses/create">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                  <FiPlus />
                  إنشاء كورس جديد
                </button>
              </Link>
            </div>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.type === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {course.type === 'online' ? 'اونلاين' : 'مسجل'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-yellow-600 font-semibold">
                      <FiDollarSign />
                      <span className="mr-1">{course.price}</span>
                      {course.discount && (
                        <span className="text-sm text-gray-500 line-through mr-2">{course.original_price}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.discount}% خصم
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FiUsers />
                      <span>{course.subscribers_count} مشترك</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiEye />
                      <span>{course.views_count} مشاهدة</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img 
                      src={course.teacher.image} 
                      alt={course.teacher.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700">{course.teacher.name}</span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setEditingCourse(course)
                        setIsModalOpen(true)
                      }}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <FiEdit size={16} />
                      <span className="text-sm">تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <FiTrash2 size={16} />
                      <span className="text-sm">حذف</span>
                    </button>
                    <Link href={`/teacher/courses/${course.id}`} className="flex-1">
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                        <FiEye size={16} />
                        <span className="text-sm">عرض</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">الكورس</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">المعلم</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">المادة</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">المرحلة</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">السعر</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">المشتركين</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">المشاهدات</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">{course.title}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              course.type === 'online' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {course.type === 'online' ? 'اونلاين' : 'مسجل'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-gray-700">{course.teacher.name}</span>
                          <img 
                            src={course.teacher.image} 
                            alt={course.teacher.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{course.subject.name}</td>
                      <td className="p-4 text-gray-700">{course.stage?.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-yellow-600 font-semibold justify-end">
                          <span>{course.price}</span>
                          <FiDollarSign />
                          {course.discount && (
                            <span className="text-sm text-gray-500 line-through mr-2">{course.original_price}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-700 justify-end">
                          <span>{course.subscribers_count}</span>
                          <FiUsers />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-700 justify-end">
                          <span>{course.views_count}</span>
                          <FiEye />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => {
                              setEditingCourse(course)
                              setIsModalOpen(true)
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-xl transition-colors"
                            title="تعديل"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors"
                            title="حذف"
                          >
                            <FiTrash2 size={16} />
                          </button>
                          <Link href={`/teacher/courses/${course.id}`}>
                            <button 
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl transition-colors"
                              title="عرض التفاصيل"
                            >
                              <FiEye size={16} />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <CourseModal
          course={editingCourse}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={updateCourse}
          stages={stages}
          subjects={subjects}
          countries={countries}
        />
      </div>
    </Layout>
  )
}
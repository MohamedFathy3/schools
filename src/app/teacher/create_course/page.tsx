'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiX, FiVideo, FiBook, FiDollarSign, FiPercent, FiLink, FiUpload } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'js-cookie'
import Layoutteacher from '@/components/Layoutteacher'

interface Stage {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
}

interface Country {
  id: number
  name: string
}

export default function AddCoursePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stage_id: '',
    subject_id: '',
    country_id: '',
    type: 'online',
    original_price: '',
    discount: '',
    what_you_will_learn: '',
    intro_video_url: '',
    image: null as File | null
  })

  const [stages, setStages] = useState<Stage[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // جلب التوكن من localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return Cookies.get('teacher_token')
    }
    return null
  }

  // جلب البيانات الأساسية
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken()
        if (!token) {
          toast.error('يجب تسجيل الدخول أولاً')
          router.push('/teacher/login')
          return
        }

        // جلب الدول
        const countriesRes = await fetch(`${API_URL}/country/index`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const countriesData = await countriesRes.json()
        if (countriesData.status === 200) setCountries(countriesData.data)

        // جلب المراحل
        const stagesRes = await fetch(`${API_URL}/stage/index`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const stagesData = await stagesRes.json()
        if (stagesData.status === 200) setStages(stagesData.data)

        // جلب المواد
        const subjectsRes = await fetch(`${API_URL}/subject/index`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const subjectsData = await subjectsRes.json()
        if (subjectsData.status === 200) setSubjects(subjectsData.data)

      } catch (error) {
        toast.error('حدث خطأ في تحميل البيانات')
      }
    }

    fetchData()
  }, [API_URL, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData(prev => ({ ...prev, image: file }))

      // معاينة الصورة
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = getToken()
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const payload = new FormData()
      
      // إضافة جميع الحقول إلى FormData
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData]
        if (value !== null && value !== undefined && value !== '') {
          if (value instanceof File) {
            payload.append(key, value)
          } else {
            payload.append(key, value.toString())
          }
        }
      })

      const res = await fetch(`${API_URL}/course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      })

      const data = await res.json()

      if (data.success) {
        toast.success('تم إضافة الكورس بنجاح!')
        router.push('/teacher/courses')
      } else {
        toast.error(data.message || 'فشل في إضافة الكورس')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة الكورس')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layoutteacher>
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <ToastContainer />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إضافة كورس جديد</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiX className="ml-2" />
            إلغاء
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-6">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">عنوان الكورس *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل عنوان الكورس"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">نوع الكورس *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="online">online</option>
                <option value="recorded">recorded</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">وصف الكورس *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل وصفًا تفصيليًا للكورس"
            />
          </div>

          {/* المعلومات الأكاديمية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">البلد *</label>
              <select
                name="country_id"
                value={formData.country_id}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر البلد</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">الماده *</label>
              <select
                name="stage_id"
                value={formData.stage_id}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الماده</option>
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">المرحلة *</label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر المرحلة</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* التسعير */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">السعر الأصلي *</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">الخصم (%)</label>
              <div className="relative">
                <FiPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* ما سيتعلمه الطالب */}
          <div>
            <label className="block text-sm font-semibold mb-2">ما سيتعلمه الطالب</label>
            <textarea
              name="what_you_will_learn"
              value={formData.what_you_will_learn}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اذكر المهارات والمعارف التي سيكتسبها الطالب"
            />
          </div>

          {/* رابط الفيديو التعريفي */}
          <div>
            <label className="block text-sm font-semibold mb-2">رابط الفيديو التعريفي</label>
            <div className="relative">
              <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                name="intro_video_url"
                value={formData.intro_video_url}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtube.com/example"
              />
            </div>
          </div>

          {/* صورة الكورس */}
          <div>
            <label className="block text-sm font-semibold mb-2">صورة الكورس *</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="hidden"
                id="course-image"
              />
              <label htmlFor="course-image" className="cursor-pointer">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة"
                      className="w-32 h-32 object-cover rounded-lg mb-4"
                    />
                    <span className="text-blue-400">تغيير الصورة</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-400">انقر لرفع صورة</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* زر الإرسال */}
          <div className="pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <FiPlus className="ml-2" />
                  إضافة الكورس
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Layoutteacher>
  )
}
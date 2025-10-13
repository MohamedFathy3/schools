'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiX, FiVideo, FiBook, FiDollarSign, FiPercent, FiLink, FiUpload, FiUsers } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
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
    image: null as File | null,
    course_type: 'group',
    currency: 'USD',
    count_student: null as number | null
  })

  const [stages, setStages] = useState<Stage[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const API_URL = '/api'

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return Cookies.get('teacher_token')
    }
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken()
        if (!token) {
          toast.error('يجب تسجيل الدخول أولاً')
          router.push('/teacher/login')
          return
        }

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
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'count_student' ? (value ? parseInt(value) : null) : value 
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData(prev => ({ ...prev, image: file }))

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
      
      if (data.result === "Success" || data.status === 200 || data.Success) {
        toast.success(data.message || 'تم إضافة الكورس بنجاح!')
        router.push('/teacher/courses')
      } else {
        toast.error(data.message || 'فشل في إضافة الكورس')
      }
    } catch (err) {
      console.error('Error adding course:', err)
      toast.error('حدث خطأ أثناء إضافة الكورس')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layoutteacher>
      <div className="min-h-screen bg-gray-50 p-6">
        <ToastContainer 
          position="top-left"
          rtl={true}
          theme="light"
        />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">إضافة كورس جديد</h1>
              <p className="text-gray-600 mt-2">أضف كورس جديد لطلابك</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl flex items-center transition-colors duration-200"
            >
              <FiX className="ml-2" />
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-8 shadow-sm border border-gray-100">
            {/* معلومات أساسية */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-r-4 border-blue-500 pr-3">المعلومات الأساسية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">عنوان الكورس *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="أدخل عنوان الكورس"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">نوع الكورس *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="online">اونلاين</option>
                    <option value="recorded">مسجل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">وصف الكورس *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="أدخل وصفًا تفصيليًا للكورس"
                />
              </div>
            </div>

            {/* المعلومات الأكاديمية */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-r-4 border-green-500 pr-3">المعلومات الأكاديمية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">البلد *</label>
                  <select
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">اختر البلد</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">المرحلة *</label>
                  <select
                    name="stage_id"
                    value={formData.stage_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">اختر المرحلة</option>
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">المادة *</label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* نوع الكورس وعدد الطلاب */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-r-4 border-purple-500 pr-3">إعدادات الكورس</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">نوع الكورس *</label>
                  <select
                    name="course_type"
                    value={formData.course_type}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="group">مجموعة</option>
                    <option value="private">خاص</option>
                  </select>
                </div>

                {formData.course_type === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">عدد الطلاب *</label>
                    <div className="relative">
                      <FiUsers className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="count_student"
                        value={formData.count_student || ''}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full pr-12 pl-4 py-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="أدخل عدد الطلاب"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* التسعير */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-r-4 border-yellow-500 pr-3">التسعير</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">العملة *</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">السعر الأصلي *</label>
                  <div className="relative">
                    <FiDollarSign className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pr-12 pl-4 py-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">الخصم (%)</label>
                  <div className="relative">
                    <FiPercent className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full pr-12 pl-4 py-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ما سيتعلمه الطالب */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-r-4 border-indigo-500 pr-3">محتوى الكورس</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">ما سيتعلمه الطالب</label>
                <textarea
                  name="what_you_will_learn"
                  value={formData.what_you_will_learn}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="اذكر المهارات والمعارف التي سيكتسبها الطالب"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">رابط الفيديو التعريفي</label>
                <div className="relative">
                  <FiLink className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="intro_video_url"
                    value={formData.intro_video_url}
                    onChange={handleInputChange}
                    className="w-full pr-12 pl-4 py-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://youtube.com/example"
                  />
                </div>
              </div>
            </div>

            {/* صورة الكورس */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-r-4 border-pink-500 pr-3">صورة الكورس</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">صورة الكورس *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
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
                          className="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200"
                        />
                        <span className="text-blue-600 hover:text-blue-700 transition-colors">تغيير الصورة</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FiUpload className="text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg mb-2">انقر لرفع صورة الكورس</p>
                        <p className="text-sm text-gray-500">PNG, JPG, JPEG - الحد الأقصى 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* زر الإرسال */}
            <div className="pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                    جاري إضافة الكورس...
                  </>
                ) : (
                  <>
                    <FiPlus className="ml-3" />
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
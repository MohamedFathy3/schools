// app/teacher/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTeacherAuth } from '@/contexts/teacherAuthContext'
import { teacherApi, Teacher } from '@/lib/teacherApi'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

// Dynamic imports for icons
const FiUser = dynamic(() => import('react-icons/fi').then(mod => mod.FiUser))
const FiMail = dynamic(() => import('react-icons/fi').then(mod => mod.FiMail))
const FiPhone = dynamic(() => import('react-icons/fi').then(mod => mod.FiPhone))
const FiCreditCard = dynamic(() => import('react-icons/fi').then(mod => mod.FiCreditCard))
const FiFlag = dynamic(() => import('react-icons/fi').then(mod => mod.FiFlag))
const FiBook = dynamic(() => import('react-icons/fi').then(mod => mod.FiBook))
const FiEdit = dynamic(() => import('react-icons/fi').then(mod => mod.FiEdit))
const FiSave = dynamic(() => import('react-icons/fi').then(mod => mod.FiSave))
const FiX = dynamic(() => import('react-icons/fi').then(mod => mod.FiX))
const FiUpload = dynamic(() => import('react-icons/fi').then(mod => mod.FiUpload))
const FiEye = dynamic(() => import('react-icons/fi').then(mod => mod.FiEye))
const FiEyeOff = dynamic(() => import('react-icons/fi').then(mod => mod.FiEyeOff))
const FiDollarSign = dynamic(() => import('react-icons/fi').then(mod => mod.FiDollarSign))
const FiUsers = dynamic(() => import('react-icons/fi').then(mod => mod.FiUsers))
const FiBookOpen = dynamic(() => import('react-icons/fi').then(mod => mod.FiBookOpen))
const FiTrendingUp = dynamic(() => import('react-icons/fi').then(mod => mod.FiTrendingUp))

interface Country {
  id: number
  name: string
  key: string
  code: string
  active: boolean
  image: string
}

interface Stage {
  id: number
  name: string
  postion: number
  active: boolean
  image: string
}

interface Subject {
  id: number
  name: string
  postion: number
  active: boolean
  image: string
}

export default function TeacherProfilePage() {
  const { user, updateUser, refreshUser } = useTeacherAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null)
  const [experiencePreview, setExperiencePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    country_id: '',
    stage_id: '',
    subject_id: '',
    account_holder_name: '',
    account_number: '',
    iban: '',
    swift_code: '',
    branch_name: '',
    wallets_name: '',
    wallets_number: '',
    image: null as File | null,
    certificate_image: null as File | null,
    experience_image: null as File | null
  })

  // تحميل البيانات الأولية
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        national_id: user.national_id || '',
        country_id: user.country?.id?.toString() || '',
        stage_id: user.stage?.id?.toString() || '',
        subject_id: user.subject?.id?.toString() || '',
        account_holder_name: user.account_holder_name || '',
        account_number: user.account_number || '',
        iban: user.iban || '',
        swift_code: user.swift_code || '',
        branch_name: user.branch_name || '',
        wallets_name: user.wallets_name || '',
        wallets_number: user.wallets_number || '',
        image: null,
        certificate_image: null,
        experience_image: null
      })

      setImagePreview(user.image || null)
      setCertificatePreview(user.certificate_image || null)
      setExperiencePreview(user.experience_image || null)
    }
  }, [user])

  // جلب البيانات الأساسية
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الدول
        const countriesRes = await fetch('/api/country/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const countriesData = await countriesRes.json()
        if (countriesData.status === 200) setCountries(countriesData.data)

        // جلب المراحل
        const stagesRes = await fetch('/api/stage/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const stagesData = await stagesRes.json()
        if (stagesData.status === 200) setStages(stagesData.data)

        // جلب المواد
        const subjectsRes = await fetch('/api/subject/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const subjectsData = await subjectsRes.json()
        if (subjectsData.status === 200) setSubjects(subjectsData.data)

      } catch (error) {
        toast.error('حدث خطأ في تحميل البيانات')
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      
      if (!file.type.startsWith('image/')) {
        toast.error('يجب أن يكون الملف صورة')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 5MB')
        return
      }
      
      setFormData(prev => ({ ...prev, [name]: file }))
      
      const reader = new FileReader()
      reader.onload = () => {
        if (name === 'image') setImagePreview(reader.result as string)
        else if (name === 'certificate_image') setCertificatePreview(reader.result as string)
        else if (name === 'experience_image') setExperiencePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (type: 'image' | 'certificate_image' | 'experience_image') => {
    setFormData(prev => ({ ...prev, [type]: null }))
    if (type === 'image') setImagePreview(user?.image || null)
    else if (type === 'certificate_image') setCertificatePreview(user?.certificate_image || null)
    else if (type === 'experience_image') setExperiencePreview(user?.experience_image || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = new FormData()
      
      // إضافة الحقول إلى FormData
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

      const data = await teacherApi.updateProfile(payload)
      
      if (data.success) {
        toast.success('تم تحديث الملف الشخصي بنجاح')
        await refreshUser() // تحديث بيانات المستخدم
        setIsEditing(false)
      } else {
        toast.error(data.message || 'فشل في تحديث البيانات')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-black">
        <div className="text-white text-xl">جاري تحميل البيانات...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black py-8 px-4">
      {/* تأثيرات الخلفية */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-white mb-2">الملف الشخصي</h1>
          <p className="text-indigo-300 text-lg">إدارة معلومات حسابك الشخصي</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Statistics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-black bg-opacity-70 rounded-3xl p-6 border border-white/20 backdrop-blur-md animate-slide-in-left">
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src={user.image} 
                    alt={user.name}
                    className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover mx-auto"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{user.name}</h2>
                <p className="text-indigo-300">{user.email}</p>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    {user.type === 'teacher' ? 'معلم' : user.type}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">التقييم</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 font-bold">{user.total_rate}</span>
                    <span className="text-yellow-400 ml-1">⭐</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">العمولة</span>
                  <span className="text-green-400 font-bold">{user.commission}</span>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="bg-black bg-opacity-70 rounded-3xl p-6 border border-white/20 backdrop-blur-md animate-slide-in-left animation-delay-200">
              <h3 className="text-lg font-semibold text-white mb-4">الإحصائيات</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
                  <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                    <FiBookOpen className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">عدد الكورسات</p>
                    <p className="text-white font-bold text-xl">{user.courses_count || 0}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                  <div className="p-2 bg-green-500 rounded-lg mr-3">
                    <FiUsers className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">عدد الطلاب</p>
                    <p className="text-white font-bold text-xl">{user.students_count || 0}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                  <div className="p-2 bg-yellow-500 rounded-lg mr-3">
                    <FiTrendingUp className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">إجمالي الدخل</p>
                    <p className="text-white font-bold text-xl">${user.total_income?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-black bg-opacity-70 rounded-3xl p-6 border border-white/20 backdrop-blur-md animate-slide-in-right">
                {/* Header with Edit Button */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {isEditing ? 'تعديل البيانات الشخصية' : 'البيانات الشخصية'}
                  </h3>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <FiEdit />
                      تعديل البيانات
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                      >
                        <FiX />
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                      >
                        <FiSave />
                        {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الصورة الشخصية */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">الصورة الشخصية</label>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                        isEditing ? 'border-indigo-500 bg-indigo-500/10 cursor-pointer' : 'border-gray-600 bg-gray-700/50'
                      }`}>
                        <input
                          type="file"
                          name="image"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          disabled={!isEditing}
                        />
                        <label 
                          htmlFor="image-upload" 
                          className={`flex flex-col items-center justify-center p-4 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          <FiUpload className="text-2xl text-indigo-400 mb-2" />
                          <span className="text-indigo-300">انقر لرفع الصورة</span>
                          <span className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG (5MB كحد أقصى)</span>
                        </label>
                      </div>
                      
                      {imagePreview && (
                        <div className="relative group">
                          <img 
                            src={imagePreview} 
                            alt="معاينة الصورة الشخصية" 
                            className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-500"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeImage('image')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <FiX size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* الحقول الأساسية */}
                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">الاسم بالكامل</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiUser />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiMail />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiPhone />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">الرقم القومي</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiCreditCard />
                      </div>
                      <input
                        type="text"
                        name="national_id"
                        value={formData.national_id}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* المعلومات الأكاديمية */}
                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">البلد</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiFlag />
                      </div>
                      <select
                        name="country_id"
                        value={formData.country_id}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed appearance-none transition-all duration-300"
                      >
                        <option value="">اختر البلد</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>{country.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">المرحلة</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiBook />
                      </div>
                      <select
                        name="stage_id"
                        value={formData.stage_id}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed appearance-none transition-all duration-300"
                      >
                        <option value="">اختر المرحلة</option>
                        {stages.map((stage) => (
                          <option key={stage.id} value={stage.id}>{stage.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">المادة</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiBook />
                      </div>
                      <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleInputChange}
                        required
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed appearance-none transition-all duration-300"
                      >
                        <option value="">اختر المادة</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* المعلومات البنكية */}
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-indigo-500 pb-2">المعلومات البنكية</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">اسم صاحب الحساب</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiUser />
                      </div>
                      <input
                        type="text"
                        name="account_holder_name"
                        value={formData.account_holder_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">رقم الحساب</label>
                    <div className="relative">
                      <div className="absolute right-3 top-3 text-indigo-400">
                        <FiDollarSign />
                      </div>
                      <input
                        type="text"
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">IBAN</label>
                    <input
                      type="text"
                      name="iban"
                      value={formData.iban}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">SWIFT Code</label>
                    <input
                      type="text"
                      name="swift_code"
                      value={formData.swift_code}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                    />
                  </div>

                  {/* المحافظ الإلكترونية */}
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-indigo-500 pb-2">المحافظ الإلكترونية</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">اسم المحفظة</label>
                    <input
                      type="text"
                      name="wallets_name"
                      value={formData.wallets_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-indigo-300 mb-2">رقم المحفظة</label>
                    <input
                      type="text"
                      name="wallets_number"
                      value={formData.wallets_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
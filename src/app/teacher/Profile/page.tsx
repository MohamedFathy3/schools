'use client'
import React, { useState, useEffect } from 'react'
import { FiSave, FiUser, FiMail, FiPhone, FiCreditCard, FiMapPin, FiBook, FiDollarSign, FiImage, FiUpload, FiEye, FiEdit2, FiPlus, FiX, FiTrash2 } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: number
  name: string
  email: string
  secound_email: string
  phone: string
  national_id: string
  teacher_type: string
  image: string | null
  certificate_image: string | null
  experience_image: string | null
  id_card_front: string | null
  id_card_back: string | null
  total_income: number | null
  country: {
    id: number
    name: string
  }
  stages: Array<{
    id: number
    name: string
  }>
  subjects: Array<{
    id: number
    name: string
    stage: {
      id: number
      name: string
    }
  }>
  account_holder_name: string | null
  account_number: string | null
  iban: string | null
  swift_code: string | null
  branch_name: string | null
  postal_transfer_full_name: string | null
  postal_transfer_office_address: string | null
  postal_transfer_recipient_name: string | null
  postal_transfer_recipient_phone: string | null
  wallets_name: string | null
  wallets_number: string | null
}

interface Country {
  id: number
  name: string
}

interface Stage {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
  stage_id: number
}

export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [allStages, setAllStages] = useState<Stage[]>([])
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    secound_email: '',
    phone: '',
    national_id: '',
    teacher_type: '',
    country_id: '',
    password: '',
    password_confirmation: '',
    stage_id: '', // سنرسل مرحلة واحدة فقط
    subject_id: '', // سنرسل مادة واحدة فقط
    account_holder_name: '',
    account_number: '',
    iban: '',
    swift_code: '',
    branch_name: '',
    postal_transfer_full_name: '',
    postal_transfer_office_address: '',
    postal_transfer_recipient_name: '',
    postal_transfer_recipient_phone: '',
    wallets_name: '',
    wallets_number: ''
  })
  const [files, setFiles] = useState({
    image: null as File | null,
    certificate_image: null as File | null,
    experience_image: null as File | null,
    id_card_front: null as File | null,
    id_card_back: null as File | null
  })
  const [filePreviews, setFilePreviews] = useState({
    image: '',
    certificate_image: '',
    experience_image: '',
    id_card_front: '',
    id_card_back: ''
  })

  const API_URL = '/api'
  const router = useRouter()

  useEffect(() => {
    fetchTeacherData()
    fetchCountries()
    fetchAllStages()
    fetchAllSubjects()
  }, [])

  const fetchTeacherData = async () => {
    try {
      const token = Cookies.get('teacher_token')
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        router.push('/teacher/login')
        return
      }

      const res = await fetch(`${API_URL}/teachers/check-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()
      
      if (data.status === 200 && data.message.teacher) {
        const teacherData = data.message.teacher
        setTeacher(teacherData)
        
        // تعيين البيانات الأساسية
        setFormData({
          name: teacherData.name || '',
          email: teacherData.email || '',
          secound_email: teacherData.secound_email || '',
          phone: teacherData.phone || '',
          national_id: teacherData.national_id || '',
          teacher_type: teacherData.teacher_type || '',
          country_id: teacherData.country?.id?.toString() || '',
          password: '',
          password_confirmation: '',
          stage_id: teacherData.stages?.[0]?.id?.toString() || '', // أول مرحلة
          subject_id: teacherData.subjects?.[0]?.id?.toString() || '', // أول مادة
          account_holder_name: teacherData.account_holder_name || '',
          account_number: teacherData.account_number || '',
          iban: teacherData.iban || '',
          swift_code: teacherData.swift_code || '',
          branch_name: teacherData.branch_name || '',
          postal_transfer_full_name: teacherData.postal_transfer_full_name || '',
          postal_transfer_office_address: teacherData.postal_transfer_office_address || '',
          postal_transfer_recipient_name: teacherData.postal_transfer_recipient_name || '',
          postal_transfer_recipient_phone: teacherData.postal_transfer_recipient_phone || '',
          wallets_name: teacherData.wallets_name || '',
          wallets_number: teacherData.wallets_number || ''
        })

        // تعيين معاينات الصور الحالية
        setFilePreviews({
          image: teacherData.image || '',
          certificate_image: teacherData.certificate_image || '',
          experience_image: teacherData.experience_image || '',
          id_card_front: teacherData.id_card_front || '',
          id_card_back: teacherData.id_card_back || ''
        })
      } else {
        toast.error('فشل في تحميل البيانات')
      }
    } catch (err) {
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_URL}/country/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {},
          orderBy: "name",
          orderByDirection: "asc",
          perPage: 100,
          paginate: true,
          delete: false
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setCountries(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching countries:', err)
    }
  }

  const fetchAllStages = async () => {
    try {
      const res = await fetch(`${API_URL}/stage/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {},
          orderBy: "name",
          orderByDirection: "asc",
          perPage: 100,
          paginate: true,
          delete: false
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setAllStages(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching stages:', err)
    }
  }

  const fetchAllSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/subject/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {},
          orderBy: "name",
          orderByDirection: "asc",
          perPage: 100,
          paginate: true,
          delete: false
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setAllSubjects(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching subjects:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFiles(prev => ({ ...prev, [field]: file }))
      
      // إنشاء معاينة للصورة
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreviews(prev => ({ ...prev, [field]: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = (field: string) => {
    setFiles(prev => ({ ...prev, [field]: null }))
    setFilePreviews(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = Cookies.get('teacher_token')
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const payload = new FormData()

      // إضافة البيانات النصية الأساسية (دون password إذا كان فارغاً)
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'password' && key !== 'password_confirmation') {
          if (value && value !== '') {
            payload.append(key, value)
          }
        }
      })

      // إضافة كلمة المرور فقط إذا تم إدخالها
      if (formData.password && formData.password.trim() !== '') {
        payload.append('password', formData.password)
        payload.append('password_confirmation', formData.password_confirmation)
      }

      // إضافة الملفات
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          payload.append(key, file)
        }
      })

      console.log('Sending form data:', Object.fromEntries(payload))

      const res = await fetch(`${API_URL}/teachers/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      })

      const data = await res.json()

      if (data.status === 200 || data.message?.includes('success') || data.message?.includes('تم')) {
        toast.success('تم تحديث البيانات بنجاح')
        fetchTeacherData() // إعادة تحميل البيانات
        setFiles({
          image: null,
          certificate_image: null,
          experience_image: null,
          id_card_front: null,
          id_card_back: null
        })
        
        // إعادة تعيين كلمة المرور بعد الحفظ الناجح
        setFormData(prev => ({
          ...prev,
          password: '',
          password_confirmation: ''
        }))
      } else {
        toast.error(data.message || 'فشل في تحديث البيانات')
        console.error('Update error:', data)
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء التحديث')
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'personal', name: 'البيانات الشخصية', icon: FiUser },
    { id: 'academic', name: 'البيانات الأكاديمية', icon: FiBook },
    { id: 'financial', name: 'البيانات المالية', icon: FiDollarSign },
    { id: 'documents', name: 'المستندات', icon: FiImage }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <ToastContainer 
          position="top-left"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                {filePreviews.image ? (
                  <img 
                    src={filePreviews.image} 
                    alt={teacher?.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <FiUser className="text-white text-3xl" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{teacher?.name}</h1>
                <p className="text-gray-600 mt-1">{teacher?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {teacher?.teacher_type}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {teacher?.country?.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{teacher?.total_income || 0} ر.س</div>
              <div className="text-gray-600">إجمالي الدخل</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="ml-2" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">البيانات الشخصية</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiUser className="ml-2 text-blue-500" />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiMail className="ml-2 text-green-500" />
                      البريد الإلكتروني الرئيسي
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      disabled
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiMail className="ml-2 text-purple-500" />
                      البريد الإلكتروني الثانوي
                    </label>
                    <input
                      type="email"
                      name="secound_email"
                      value={formData.secound_email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiPhone className="ml-2 text-red-500" />
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiCreditCard className="ml-2 text-orange-500" />
                      رقم الهوية الوطنية
                    </label>
                    <input
                      type="text"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiMapPin className="ml-2 text-teal-500" />
                      الدولة
                    </label>
                    <select
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      required
                    >
                      <option value="">اختر الدولة</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">تغيير كلمة المرور</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                        placeholder="اتركه فارغاً للحفاظ على كلمة المرور الحالية"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        تأكيد كلمة المرور
                      </label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                        placeholder="اتركه فارغاً للحفاظ على كلمة المرور الحالية"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Information Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">البيانات الأكاديمية</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FiBook className="ml-2 text-blue-500" />
                      التخصص / نوع المعلم
                    </label>
                    <input
                      type="text"
                      name="teacher_type"
                      value={formData.teacher_type}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      placeholder="مثال: مدرس لغة عربية، مدرس رياضيات، إلخ..."
                    />
                  </div>

                  {/* Stage Selection */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      المرحلة الدراسية الرئيسية
                    </label>
                    <select
                      name="stage_id"
                      value={formData.stage_id}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    >
                      <option value="">اختر المرحلة الدراسية</option>
                      {allStages.map(stage => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selection */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      المادة الدراسية الرئيسية
                    </label>
                    <select
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    >
                      <option value="">اختر المادة الدراسية</option>
                      {allSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Stages & Subjects Display */}
                  {(teacher?.stages && teacher.stages.length > 0) || (teacher?.subjects && teacher.subjects.length > 0) ? (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">البيانات الحالية</h3>
                      
                      {teacher.stages && teacher.stages.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            المراحل الحالية
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {teacher.stages.map(stage => (
                              <span
                                key={stage.id}
                                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-xl border border-blue-300 text-sm font-medium"
                              >
                                {stage.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {teacher.subjects && teacher.subjects.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            المواد الحالية
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {teacher.subjects.map(subject => (
                              <span
                                key={subject.id}
                                className="bg-green-100 text-green-800 px-3 py-2 rounded-xl border border-green-300 text-sm font-medium"
                              >
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Financial Information Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">البيانات المالية</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      اسم صاحب الحساب
                    </label>
                    <input
                      type="text"
                      name="account_holder_name"
                      value={formData.account_holder_name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      رقم الحساب
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      رقم IBAN
                    </label>
                    <input
                      type="text"
                      name="iban"
                      value={formData.iban}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      رمز SWIFT
                    </label>
                    <input
                      type="text"
                      name="swift_code"
                      value={formData.swift_code}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      اسم الفرع
                    </label>
                    <input
                      type="text"
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Postal Transfer Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">تحويل بريدي</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        name="postal_transfer_full_name"
                        value={formData.postal_transfer_full_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        عنوان المكتب
                      </label>
                      <input
                        type="text"
                        name="postal_transfer_office_address"
                        value={formData.postal_transfer_office_address}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        اسم المستلم
                      </label>
                      <input
                        type="text"
                        name="postal_transfer_recipient_name"
                        value={formData.postal_transfer_recipient_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        هاتف المستلم
                      </label>
                      <input
                        type="text"
                        name="postal_transfer_recipient_phone"
                        value={formData.postal_transfer_recipient_phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Wallets Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">المحافظ الإلكترونية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        اسم المحفظة
                      </label>
                      <input
                        type="text"
                        name="wallets_name"
                        value={formData.wallets_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        رقم المحفظة
                      </label>
                      <input
                        type="text"
                        name="wallets_number"
                        value={formData.wallets_number}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">المستندات والصور</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      الصورة الشخصية
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-blue-400 bg-gray-50">
                      {filePreviews.image ? (
                        <div className="mb-4">
                          <img 
                            src={filePreviews.image} 
                            alt="معاينة الصورة الشخصية"
                            className="w-32 h-32 rounded-xl object-cover mx-auto border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('image')}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            حذف الصورة
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-gray-400 text-2xl mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">اسحب وأفلت الصورة هنا أو انقر للاختيار</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                        id="image"
                      />
                      <label
                        htmlFor="image"
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-700 inline-block"
                      >
                        {filePreviews.image ? 'تغيير الصورة' : 'اختيار صورة'}
                      </label>
                      {files.image && !filePreviews.image && (
                        <p className="text-green-600 mt-2">تم اختيار: {files.image.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Certificate Image */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      صورة الشهادة
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-green-400 bg-gray-50">
                      {filePreviews.certificate_image ? (
                        <div className="mb-4">
                          <img 
                            src={filePreviews.certificate_image} 
                            alt="معاينة صورة الشهادة"
                            className="w-32 h-32 rounded-xl object-cover mx-auto border-2 border-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('certificate_image')}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            حذف الصورة
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-gray-400 text-2xl mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">اسحب وأفلت صورة الشهادة هنا</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'certificate_image')}
                        className="hidden"
                        id="certificate_image"
                      />
                      <label
                        htmlFor="certificate_image"
                        className="bg-green-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-green-700 inline-block"
                      >
                        {filePreviews.certificate_image ? 'تغيير الصورة' : 'اختيار صورة'}
                      </label>
                      {files.certificate_image && !filePreviews.certificate_image && (
                        <p className="text-green-600 mt-2">تم اختيار: {files.certificate_image.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Experience Image */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      صورة الخبرة
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-purple-400 bg-gray-50">
                      {filePreviews.experience_image ? (
                        <div className="mb-4">
                          <img 
                            src={filePreviews.experience_image} 
                            alt="معاينة صورة الخبرة"
                            className="w-32 h-32 rounded-xl object-cover mx-auto border-2 border-purple-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('experience_image')}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            حذف الصورة
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-gray-400 text-2xl mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">اسحب وأفلت صورة الخبرة هنا</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'experience_image')}
                        className="hidden"
                        id="experience_image"
                      />
                      <label
                        htmlFor="experience_image"
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-purple-700 inline-block"
                      >
                        {filePreviews.experience_image ? 'تغيير الصورة' : 'اختيار صورة'}
                      </label>
                      {files.experience_image && !filePreviews.experience_image && (
                        <p className="text-green-600 mt-2">تم اختيار: {files.experience_image.name}</p>
                      )}
                    </div>
                  </div>

                  {/* ID Card Front */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      وجه البطاقة الشخصية
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-orange-400 bg-gray-50">
                      {filePreviews.id_card_front ? (
                        <div className="mb-4">
                          <img 
                            src={filePreviews.id_card_front} 
                            alt="معاينة وجه البطاقة"
                            className="w-32 h-32 rounded-xl object-cover mx-auto border-2 border-orange-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('id_card_front')}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            حذف الصورة
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-gray-400 text-2xl mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">اسحب وأفلت صورة الوجه الأمامي</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'id_card_front')}
                        className="hidden"
                        id="id_card_front"
                      />
                      <label
                        htmlFor="id_card_front"
                        className="bg-orange-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-orange-700 inline-block"
                      >
                        {filePreviews.id_card_front ? 'تغيير الصورة' : 'اختيار صورة'}
                      </label>
                      {files.id_card_front && !filePreviews.id_card_front && (
                        <p className="text-green-600 mt-2">تم اختيار: {files.id_card_front.name}</p>
                      )}
                    </div>
                  </div>

                  {/* ID Card Back */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ظهر البطاقة الشخصية
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-red-400 bg-gray-50">
                      {filePreviews.id_card_back ? (
                        <div className="mb-4">
                          <img 
                            src={filePreviews.id_card_back} 
                            alt="معاينة ظهر البطاقة"
                            className="w-32 h-32 rounded-xl object-cover mx-auto border-2 border-red-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('id_card_back')}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            حذف الصورة
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-gray-400 text-2xl mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">اسحب وأفلت صورة الوجه الخلفي</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'id_card_back')}
                        className="hidden"
                        id="id_card_back"
                      />
                      <label
                        htmlFor="id_card_back"
                        className="bg-red-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-red-700 inline-block"
                      >
                        {filePreviews.id_card_back ? 'تغيير الصورة' : 'اختيار صورة'}
                      </label>
                      {files.id_card_back && !filePreviews.id_card_back && (
                        <p className="text-green-600 mt-2">تم اختيار: {files.id_card_back.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-4 pt-8 border-t border-gray-200 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg border border-blue-500 font-semibold"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </div>
                ) : (
                  <>
                    <FiSave className="ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
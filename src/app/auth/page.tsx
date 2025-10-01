// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import '@/styles/globals.css'

const FiMail = dynamic(() => import('react-icons/fi').then(mod => mod.FiMail))
const FiLock = dynamic(() => import('react-icons/fi').then(mod => mod.FiLock))
const FiUser = dynamic(() => import('react-icons/fi').then(mod => mod.FiUser))
const FiArrowRight = dynamic(() => import('react-icons/fi').then(mod => mod.FiArrowRight))
const FiPhone = dynamic(() => import('react-icons/fi').then(mod => mod.FiPhone))
const FiCreditCard = dynamic(() => import('react-icons/fi').then(mod => mod.FiCreditCard))
const FiBook = dynamic(() => import('react-icons/fi').then(mod => mod.FiBook))
const FiFlag = dynamic(() => import('react-icons/fi').then(mod => mod.FiFlag))
const FiCheck = dynamic(() => import('react-icons/fi').then(mod => mod.FiCheck))
const FiX = dynamic(() => import('react-icons/fi').then(mod => mod.FiX))
const FiUpload = dynamic(() => import('react-icons/fi').then(mod => mod.FiUpload))
const FiEye = dynamic(() => import('react-icons/fi').then(mod => mod.FiEye))
const FiEyeOff = dynamic(() => import('react-icons/fi').then(mod => mod.FiEyeOff))

export interface Stage {
  id: number
  name: string
  country: {id:number, name:string, image?: string} | null
  active: boolean
  image: string
  postion: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deleted: boolean
}

type Subject = {
  id: number
  name: string
  stage_id: number
  stage: {id:number, name: string, postion: number}
  stage_name?: string
  position?: number
  active: boolean
  image?: string
}

export interface Country {
  id: number
  name: string
  key: string
  code: string
  active: boolean
  image: string
  orderId: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deleted: boolean
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  national_id?: string
  password?: string
  password_confirmation?: string
  country_id?: string
  stage_id?: string
  subject_id?: string
  image?: string
  certificate_image?: string
  experience_image?: string
}

export default function TeacherRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    password: '',
    password_confirmation: '',
    country_id: '',
    stage_id: '',
    subject_id: '',
    image: null as File | null,
    certificate_image: null as File | null,
    experience_image: null as File | null
  })

  const [countries, setCountries] = useState([])
  const [stages, setStages] = useState([])
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null)
  const [experiencePreview, setExperiencePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const API_URL = '/api'
  const formRef = useRef<HTMLFormElement>(null)

  // جلب البيانات الأساسية
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // جلب الدول
        const countriesRes = await fetch(`${API_URL}/country/index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const countriesData = await countriesRes.json()
        if (countriesData.status === 200) setCountries(countriesData.data)

        // جلب المراحل
        const stagesRes = await fetch(`${API_URL}/stage/index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const stagesData = await stagesRes.json()
        if (stagesData.status === 200) setStages(stagesData.data)

        // جلب المواد
        const subjectsRes = await fetch(`${API_URL}/subject/index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: {}, perPage: 100, paginate: true })
        })
        const subjectsData = await subjectsRes.json()
        if (subjectsData.status === 200) setSubjects(subjectsData.data)

      } catch (error) {
        toast.error('حدث خطأ في تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [API_URL])

  // التحقق من صحة البيانات
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب'
      else if (formData.name.trim().length < 3) newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل'

      if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صالح'

      if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب'
      else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) newErrors.phone = 'رقم الهاتف غير صالح'

      if (!formData.national_id.trim()) newErrors.national_id = 'الرقم القومي مطلوب'
      else if (!/^[0-9]{14}$/.test(formData.national_id)) newErrors.national_id = 'الرقم القومي يجب أن يكون 14 رقمًا'

      if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة'
      else if (formData.password.length < 6) newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'

      if (!formData.password_confirmation) newErrors.password_confirmation = 'تأكيد كلمة المرور مطلوب'
      else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'كلمة المرور غير متطابقة'
    }

    if (step === 2) {
      if (!formData.country_id) newErrors.country_id = 'البلد مطلوب'
      if (!formData.stage_id) newErrors.stage_id = 'المرحلة مطلوبة'
      if (!formData.subject_id) newErrors.subject_id = 'المادة مطلوبة'
      if (!formData.certificate_image) newErrors.certificate_image = 'صورة الشهادة مطلوبة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // إزالة الخطأ عند البدء بالكتابة
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [name]: 'يجب أن يكون الملف صورة' }))
        return
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [name]: 'حجم الملف يجب أن يكون أقل من 5MB' }))
        return
      }
      
      setFormData(prev => ({ ...prev, [name]: file }))
      
      // إنشاء معاينة للصورة
      const reader = new FileReader()
      reader.onload = () => {
        if (name === 'image') setImagePreview(reader.result as string)
        else if (name === 'certificate_image') setCertificatePreview(reader.result as string)
        else if (name === 'experience_image') setExperiencePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // إزالة الخطأ
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }))
      }
    }
  }

  const removeImage = (type: 'image' | 'certificate_image' | 'experience_image') => {
    setFormData(prev => ({ ...prev, [type]: null }))
    if (type === 'image') setImagePreview(null)
    else if (type === 'certificate_image') setCertificatePreview(null)
    else if (type === 'experience_image') setExperiencePreview(null)
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      // تحريك الصفحة للأعلى عند تغيير الخطوة
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    // تحريك الصفحة للأعلى عند تغيير الخطوة
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) return
    
    setIsSubmitting(true)

    try {
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

      const res = await fetch(`${API_URL}/teachers/register`, {
        method: 'POST',
        body: payload
      })

      const data = await res.json()

      if (data.success) {
        toast.success('تم التسجيل بنجاح! سيتم مراجعة طلبك من قبل الإدارة')
        setTimeout(() => {
          router.push('/teacher/login')
        }, 2000)
      } else {
        toast.error(data.message || 'فشل في التسجيل')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء التسجيل')
    } finally {
      setIsSubmitting(false)
    }
  }

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      national_id: '',
      password: '',
      password_confirmation: '',
      country_id: '',
      stage_id: '',
      subject_id: '',
      image: null,
      certificate_image: null,
      experience_image: null
    })
    setImagePreview(null)
    setCertificatePreview(null)
    setExperiencePreview(null)
    setErrors({})
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-black relative overflow-hidden py-8">
      {/* تأثيرات الخلفية */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl p-6 md:p-8 mx-4 bg-black bg-opacity-70 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-md transition-all duration-500 hover:shadow-indigo-500/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white animate-fade-in">تسجيل معلم جديد</h1>
          <p className="text-indigo-300 mt-2 animate-fade-in animation-delay-300">املأ البيانات التالية للتسجيل في المنصة</p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentStep >= step 
                    ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/50' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {currentStep > step ? (
                    <FiCheck className="text-white" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-1 mx-2 transition-all duration-500 ${
                    currentStep > step ? 'bg-indigo-600' : 'bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* الخطوة 1: المعلومات الشخصية */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="md:col-span-2">
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                    placeholder="أدخل اسمك بالكامل"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.name}</p>}
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                    placeholder="example@domain.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.email}</p>}
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.phone}</p>}
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.national_id ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                    placeholder="14 رقم قومي"
                    maxLength={14}
                  />
                </div>
                {errors.national_id && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.national_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute right-3 top-3 text-indigo-400">
                    <FiLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                    placeholder="6 أحرف على الأقل"
                  />
                  <button 
                    type="button"
                    className="absolute left-3 top-3 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <div className="absolute right-3 top-3 text-indigo-400">
                    <FiLock />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.password_confirmation ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                    placeholder="تأكيد كلمة المرور"
                  />
                  <button 
                    type="button"
                    className="absolute left-3 top-3 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.password_confirmation}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-indigo-300 mb-2">الصورة الشخصية</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                    errors.image ? 'border-red-500 bg-red-500/10' : 'border-indigo-500 bg-indigo-500/10'
                  }`}>
                    <input
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center p-4">
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
                        className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-500 transition-all duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('image')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.image}</p>}
              </div>
            </div>
          )}

          {/* الخطوة 2: المعلومات الأكاديمية */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 appearance-none transition-all duration-300 ${
                      errors.country_id ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">اختر البلد</option>
                    {countries.map((country: Country) => (
                      <option key={country.id} value={country.id}>{country.name}</option>
                    ))}
                  </select>
                </div>
                {errors.country_id && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.country_id}</p>}
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 appearance-none transition-all duration-300 ${
                      errors.stage_id ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">اختر المرحلة</option>
                    {stages.map((stage: Stage) => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
                {errors.stage_id && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.stage_id}</p>}
              </div>

              <div>
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
                    className={`w-full p-3 pr-10 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-2 appearance-none transition-all duration-300 ${
                      errors.subject_id ? 'border-red-500 focus:ring-red-500' : 'border-indigo-600 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map((subject: Subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                {errors.subject_id && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.subject_id}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-indigo-300 mb-2">صورة الشهادة</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                    errors.certificate_image ? 'border-red-500 bg-red-500/10' : 'border-indigo-500 bg-indigo-500/10'
                  }`}>
                    <input
                      type="file"
                      name="certificate_image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label htmlFor="certificate-upload" className="cursor-pointer flex flex-col items-center justify-center p-4">
                      <FiUpload className="text-2xl text-indigo-400 mb-2" />
                      <span className="text-indigo-300">انقر لرفع صورة الشهادة</span>
                      <span className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG (5MB كحد أقصى)</span>
                    </label>
                  </div>
                  
                  {certificatePreview && (
                    <div className="relative group">
                      <img 
                        src={certificatePreview} 
                        alt="معاينة الشهادة" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-500 transition-all duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('certificate_image')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {errors.certificate_image && <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.certificate_image}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-indigo-300 mb-2">صورة الخبرة (اختياري)</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 border-2 border-dashed border-indigo-500 rounded-lg p-4 text-center bg-indigo-500/10 transition-all duration-300">
                    <input
                      type="file"
                      name="experience_image"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="experience-upload"
                    />
                    <label htmlFor="experience-upload" className="cursor-pointer flex flex-col items-center justify-center p-4">
                      <FiUpload className="text-2xl text-indigo-400 mb-2" />
                      <span className="text-indigo-300">انقر لرفع صورة الخبرة</span>
                      <span className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG (5MB كحد أقصى)</span>
                    </label>
                  </div>
                  
                  {experiencePreview && (
                    <div className="relative group">
                      <img 
                        src={experiencePreview} 
                        alt="معاينة الخبرة" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-500 transition-all duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('experience_image')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* الخطوة 3: المراجعة */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="bg-gray-800 p-6 rounded-lg border border-indigo-500/30">
                <h3 className="text-xl font-semibold text-white mb-4 text-center">مراجعة البيانات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-indigo-300 font-medium">الاسم:</p>
                    <p className="text-white mt-1">{formData.name || 'غير مذكور'}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-indigo-300 font-medium">البريد الإلكتروني:</p>
                    <p className="text-white mt-1">{formData.email || 'غير مذكور'}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-indigo-300 font-medium">رقم الهاتف:</p>
                    <p className="text-white mt-1">{formData.phone || 'غير مذكور'}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-indigo-300 font-medium">الرقم القومي:</p>
                    <p className="text-white mt-1">{formData.national_id || 'غير مذكور'}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-indigo-300 font-medium">البلد:</p>
                    <p className="text-white mt-1">
                      {countries.find((c: any) => c.id == formData.country_id)?.name || 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-indigo-300 font-medium">المرحلة:</p>
                    <p className="text-white mt-1">
                      {stages.find((s: any) => s.id == formData.stage_id)?.name || 'غير محددة'}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg md:col-span-2">
                    <p className="text-indigo-300 font-medium">المادة:</p>
                    <p className="text-white mt-1">
                      {subjects.find((s: any) => s.id == formData.subject_id)?.name || 'غير محددة'}
                    </p>
                  </div>
                  
                  {/* معاينات الصور */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {imagePreview && (
                      <div className="text-center">
                        <p className="text-indigo-300 font-medium mb-2">الصورة الشخصية</p>
                        <img 
                          src={imagePreview} 
                          alt="معاينة الصورة الشخصية" 
                          className="w-24 h-24 object-cover rounded-lg mx-auto border border-indigo-500"
                        />
                      </div>
                    )}
                    {certificatePreview && (
                      <div className="text-center">
                        <p className="text-indigo-300 font-medium mb-2">صورة الشهادة</p>
                        <img 
                          src={certificatePreview} 
                          alt="معاينة الشهادة" 
                          className="w-24 h-24 object-cover rounded-lg mx-auto border border-indigo-500"
                        />
                      </div>
                    )}
                    {experiencePreview && (
                      <div className="text-center">
                        <p className="text-indigo-300 font-medium mb-2">صورة الخبرة</p>
                        <img 
                          src={experiencePreview} 
                          alt="معاينة الخبرة" 
                          className="w-24 h-24 object-cover rounded-lg mx-auto border border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-200 text-sm text-center">
                  <strong>ملاحظة:</strong> سيتم مراجعة طلبك من قبل إدارة المنصة قبل تفعيل حسابك. قد تستغرق هذه العملية حتى 48 ساعة.
                </p>
              </div>
            </div>
          )}

          {/* أزرار التنقل */}
          <div className="flex flex-col md:flex-row justify-between pt-6 gap-4">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                >
                  <FiArrowRight className="transform rotate-180" />
                  السابق
                </button>
              )}
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300"
              >
                إعادة تعيين
              </button>
            </div>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                التالي
                <FiArrowRight />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300"
                >
                  السابق
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      تأكيد التسجيل
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
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
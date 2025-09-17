// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import '@/styles/globals.css'
import Link from "next/link";

const FiMail = dynamic(() => import('react-icons/fi').then(mod => mod.FiMail))
const FiLock = dynamic(() => import('react-icons/fi').then(mod => mod.FiLock))
const FiUser = dynamic(() => import('react-icons/fi').then(mod => mod.FiUser))
const FiArrowRight = dynamic(() => import('react-icons/fi').then(mod => mod.FiArrowRight))
const FiPhone = dynamic(() => import('react-icons/fi').then(mod => mod.FiPhone))
const FiCreditCard = dynamic(() => import('react-icons/fi').then(mod => mod.FiCreditCard))
const FiBook = dynamic(() => import('react-icons/fi').then(mod => mod.FiBook))
const FiFlag = dynamic(() => import('react-icons/fi').then(mod => mod.FiFlag))
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



export default function TeacherRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    password: '',
    password_confirmation:'',
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

  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // جلب البيانات الأساسية
  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    }

    fetchData()
  }, [API_URL])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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
        toast.success('تم التسجيل بنجاح!')
        router.push('/teacher/')
      } else {
        toast.error(data.message || 'فشل في التسجيل')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء التسجيل')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-black relative overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl p-8 mx-4 bg-black bg-opacity-60 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">تسجيل معلم جديد</h1>
          <p className="text-indigo-300 mt-2">املأ البيانات التالية للتسجيل</p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {step}
                </div>
                {step < 3 && <div className="w-8 h-0.5 bg-gray-600 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الخطوة 1: المعلومات الشخصية */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">الاسم بالكامل</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">الرقم القومي</label>
                <input
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

  <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">كلمة المرور تاكيد </label>
                <input
                  type="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">صورة شخصية</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600"
                />
              </div>
            </div>
          )}

          {/* الخطوة 2: المعلومات الأكاديمية */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">البلد</label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">اختر البلد</option>
                  
                  {countries.map((country: Country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">المرحله</label>
                <select
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">اختر الماده</option>
                  {stages.map((stage: Stage) => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">الماده</label>
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">اختر المرحله</option>
                  {subjects.map((subject: Subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">صورة الشهادة</label>
                <input
                  type="file"
                  name="certificate_image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-indigo-300 mb-2">صورة الخبرة</label>
                <input
                  type="file"
                  name="experience_image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-indigo-600"
                />
              </div>
            </div>
          )}

          {/* الخطوة 3: المراجعة */}
          
          {currentStep === 3 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">مراجعة البيانات</h3>
              <div className="space-y-3 text-sm">
                <p><span className="text-indigo-300">الاسم:</span> {formData.name}</p>
                <p><span className="text-indigo-300">البريد:</span> {formData.email}</p>
                <p><span className="text-indigo-300">الهاتف:</span> {formData.phone}</p>
                <p><span className="text-indigo-300">الرقم القومي:</span> {formData.national_id}</p>
                <p><span className="text-indigo-300">الرقم السري:</span> {formData.password}</p>
      {/* // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                <p><span className="text-indigo-300">البلد:</span> {countries.find((c: any) => c.id == formData.country_id)?.name}</p>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <p><span className="text-indigo-300">المرحلة:</span> {stages.find((s: any) => s.id == formData.stage_id)?.name}</p>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <p><span className="text-indigo-300">المادة:</span> {subjects.find((s: any) => s.id == formData.subject_id)?.name}</p> */}
              </div>
            </div>
          )}

          {/* أزرار التنقل */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                السابق
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
              >
                التالي
              </button>
            ) : (
              <Link href="/teacher/login">
  <button
    type="button"
    disabled={isLoading}
    className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
  >
    {isLoading ? 'جاري التسجيل...' : 'تسجيل'}
  </button>
</Link>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
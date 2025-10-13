'use client'
import React, { useState } from 'react'
import { FiSave, FiArrowLeft, FiClock, FiBook, FiFileText } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import Link from 'next/link'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export default function CreateExamPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    course_id: params.id,
    title: '',
    duration: 60,
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const API_URL = '/api';
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const token = Cookies.get('teacher_token')
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً')
      setLoading(false)
      return
    }

    const res = await fetch(`${API_URL}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    const data = await res.json()
    
    // تحقق من الاستجابة بشكل صحيح
    if (data.status === 200 && data.result === "Success") {
      toast.success('تم إنشاء الامتحان بنجاح 🎉')
      // انتظر قليلاً ثم انتقل للصفحة التالية
      setTimeout(() => {
        router.push(`/teacher/courses/${params.id}/exams/`)
      }, 1500)
    } else {
      toast.error(data.data || data.message || 'فشل في إنشاء الامتحان')
    }
  } catch (err) {
    toast.error('حدث خطأ أثناء إنشاء الامتحان')
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
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
          toastClassName="rounded-2xl shadow-lg bg-white border border-gray-200"
          progressClassName="bg-gradient-to-r from-blue-500 to-blue-600"
        />

        {/* Header Section */}
        <div className="mb-8">
          <Link 
            href={`/teacher/courses/${params.id}/exams`} 
            className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:-translate-x-2 shadow-lg hover:shadow-xl border border-gray-200"
          >
            <FiArrowLeft className="ml-2" />
            العودة إلى قائمة الامتحانات
          </Link>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl p-8 max-w-2xl mx-auto shadow-xl border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiBook className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">إنشاء امتحان جديد</h1>
            <p className="text-gray-600">املأ البيانات التالية لإنشاء امتحان جديد للطلاب</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FiFileText className="ml-2 text-blue-500" />
                عنوان الامتحان
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 group-hover:border-gray-400"
                required
                placeholder="أدخل عنوان الامتحان..."
              />
            </div>

            {/* Description Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                وصف الامتحان
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 group-hover:border-gray-400 resize-none"
                placeholder="أدخل تفاصيل ووصف الامتحان للطلاب..."
                rows={4}
                required
              />
            </div>

            {/* Duration Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FiClock className="ml-2 text-green-500" />
                مدة الامتحان (دقيقة)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 group-hover:border-gray-400 pr-12"
                  required
                  min="1"
                />
             
              </div>
              <p className="text-sm text-gray-500 mt-2">
                المدة الافتراضية 60 دقيقة - يمكنك تعديلها حسب احتياجات الامتحان
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg border border-blue-500 font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإنشاء...
                  </div>
                ) : (
                  <>
                    <FiSave className="ml-2" />
                    إنشاء الامتحان
                  </>
                )}
              </button>
              
              <Link
                href={`/teacher/courses/${params.id}/exams`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl border border-gray-300 font-semibold text-center"
              >
                إلغاء
              </Link>
            </div>
          </form>

          {/* Tips Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              💡 نصائح لإنشاء امتحان ناجح
            </h3>
            <ul className="text-blue-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="ml-2">•</span>
                اختر عنواناً واضحاً ومعبراً عن محتوى الامتحان
              </li>
              <li className="flex items-start">
                <span className="ml-2">•</span>
                اكتب وصفاً مفصلاً يساعد الطلاب على فهم طبيعة الأسئلة
              </li>
              <li className="flex items-start">
                <span className="ml-2">•</span>
                حدد مدة مناسبة تغطي جميع الأسئلة مع وقت مراجعة
              </li>
            </ul>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-green-200 to-purple-200"></div>
        </div>
      </div>
    </Layout>
  )
}
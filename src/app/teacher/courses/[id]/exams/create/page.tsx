'use client'
import React, { useState } from 'react'
import { FiSave, FiArrowLeft } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
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
        toast.success('تم إنشاء الامتحان بنجاح')
        router.push(`/teacher/courses/${params.id}/exams/`)

      if (data.message === 'Exam created successfully') {
      } else {
        toast.error(data.message || 'فشل في إنشاء الامتحان')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء الامتحان')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen">
        <ToastContainer />

        <div className="mb-6">
          <Link href={`/teacher/courses/${params.id}/exams`} className="inline-flex items-center text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="ml-1" />
            العودة إلى قائمة الامتحانات
          </Link>
        </div>

        <div className="bg-gray-700 rounded-2xl p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">إنشاء امتحان جديد</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">عنوان الامتحان</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                required
                placeholder="أدخل عنوان الامتحان"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">وصف الامتحان</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                placeholder="أدخل تفاصيل الامتحان"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">مدة الامتحان (دقيقة)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                required
                min="1"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center disabled:opacity-50"
              >
                {loading ? 'جاري الإنشاء...' : (
                  <>
                    <FiSave className="ml-2" />
                    إنشاء الامتحان
                  </>
                )}
              </button>
              <Link
                href={`/teacher/courses/${params.id}/exams`}
                className="bg-gray-600 text-white px-6 py-2 rounded-xl"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

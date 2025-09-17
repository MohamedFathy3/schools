// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import React, { useState, useEffect } from 'react'
import { FiEye, FiPlus, FiArrowLeft, FiEdit, FiTrash2, FiBook } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'

interface Exam {
  id: number
  course_id: number
  title: string
  duration: number
  created_at: string
  description:string
  questions_count: number
}

export default function CourseExamsPage({ params }: { params: { id: string } }) {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const fetchExams = async (courseId: number) => {
  try {
      const token = Cookies.get('teacher_token')

    const res = await fetch(`${API_URL}/course/${courseId}/exams`,{
      headers: { Authorization: `Bearer ${token}` },

    })
    const data = await res.json()

    if (data.status === 200) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const examsWithDefaults = (data.data || []).map((exam: any) => ({
        ...exam,
        duration: exam.duration || 0,
        questions_count: exam.questions_count || 0,
        description: exam.description || '',
      }))
      setExams(examsWithDefaults)
    } else {
      toast.error('حدث خطأ في تحميل الامتحانات')
    }
  } catch (err) {
    toast.error('حدث خطأ في تحميل الامتحانات')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  fetchExams(parseInt(params.id, 10))
}, [params.id])



  // const deleteExam = async (examId: number) => {
  //   if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return

  //   try {
  //     const res = await fetch(`${API_URL}/exams/${examId}`, {
  //       method: 'DELETE'
  //     })
  //     const data = await res.json()

  //     if (data.message === "Exam deleted successfully") {
  //       toast.success('تم حذف الامتحان بنجاح')
  // fetchExams(parseInt(params.id, 10))
  //     } else {
  //       toast.error(data.message || 'فشل في حذف الامتحان')
  //     }
  //   } catch (err) {
  //     toast.error('حدث خطأ أثناء الحذف')
  //   }
  // }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-white">جار التحميل...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen">
        <ToastContainer />
        
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/teacher/courses/${params.id}`} className="inline-flex items-center text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="ml-1" />
            العودة إلى الكورس
          </Link>

          <Link 
            href={`/teacher/courses/${params.id}/exams/create`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="ml-2" />
            إنشاء امتحان جديد
          </Link>
        </div>

        <div className="bg-gray-700 rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-6">امتحانات الكورس</h1>

          {exams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiBook className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-lg mb-4">لا توجد امتحانات لهذا الكورس</p>
              <Link 
                href={`/teacher/courses/${params.id}/exams/create`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center"
              >
                <FiPlus className="ml-2" />
                إنشاء أول امتحان
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-gray-600 rounded-xl p-4 hover:bg-gray-500 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    <div className="flex gap-2">
                      {/* <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-red-400 hover:text-red-300"
                        title="حذف الامتحان"
                      >
                        <FiTrash2 />
                      </button> */}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    المدة: {exam.duration} دقيقة
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3">
                    عدد الأسئلة: {exam.questions_count || 0}
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-4">
                    تم الإنشاء: {new Date(exam.created_at).toLocaleDateString('ar-EG')}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/teacher/courses/${params.id}/exams/${exam.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center justify-center flex-1"
                    >
                      <FiEye className="ml-1" />
                      إدارة الأسئلة
                    </Link>
                    
                  
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
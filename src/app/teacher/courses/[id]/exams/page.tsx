// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import React, { useState, useEffect } from 'react'
import { FiEye, FiPlus, FiArrowLeft, FiEdit, FiTrash2, FiBook } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
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
  const API_URL = '/api';

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

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-white min-h-screen flex items-center justify-center">
          <div className="text-gray-700">جار التحميل...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <ToastContainer />
        
        <div className="mb-6 flex justify-between items-center">
          <Link 
            href={`/teacher/courses/${params.id}`} 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-400 transition-all duration-300"
          >
            <FiArrowLeft className="ml-1" />
            العودة إلى الكورس
          </Link>

          <Link 
            href={`/teacher/courses/${params.id}/exams/create`}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FiPlus className="ml-2" />
            إنشاء امتحان جديد
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">امتحانات الكورس</h1>

          {exams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiBook className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-4">لا توجد امتحانات لهذا الكورس</p>
              <Link 
                href={`/teacher/courses/${params.id}/exams/create`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FiPlus className="ml-2" />
                إنشاء أول امتحان
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      {exam.title}
                    </h3>
                    <div className="flex gap-2">
                      {/* <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-red-500 hover:text-red-600 transition-colors duration-300"
                        title="حذف الامتحان"
                      >
                        <FiTrash2 />
                      </button> */}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">
                      المدة: {exam.duration} دقيقة
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4 flex items-center">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium ml-2">
                      عدد الأسئلة: {exam.questions_count || 0}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
                    تم الإنشاء: {new Date(exam.created_at).toLocaleDateString('ar-EG')}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/teacher/courses/${params.id}/exams/${exam.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center flex-1 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
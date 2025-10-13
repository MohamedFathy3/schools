'use client'
import React, { useState, useEffect } from 'react'
import { FiStar, FiTrash2, FiMessageSquare, FiUsers, FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import Link from 'next/link'
import Layout from '@/components/Layoutteacher'
import { useParams } from 'next/navigation'
import Cookies from 'js-cookie'

interface Student {
  id: number
  name: string
  email: string
  phone: string
  image: string | null
  qr_code: string
  birth_day: string | null
  average_rating: number
  comment?: string
  rating?: number
  commented_at?: string
}

interface CommentData {
  comment: string
  rating: number
}

export default function CourseStudentsPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentData, setCommentData] = useState<CommentData>({
    comment: '',
    rating: 5
  })

  const API_URL = '/api'

  // جلب بيانات الطلاب
  const fetchStudents = async () => {
    try {
      const token = Cookies.get('teacher_token')
      const res = await fetch(`${API_URL}/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      
      if (data.status === 200) {
        setStudents(data.data.students || [])
        toast.success(`تم تحميل ${data.data.students?.length || 0} طالب`)
      } else {
        toast.error('حدث خطأ في تحميل بيانات الطلاب')
      }
    } catch (err) {
      toast.error('حدث خطأ في تحميل بيانات الطلاب')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [courseId])

  // إضافة تعليق وتقييم
  const handleAddComment = async () => {
    if (!selectedStudent) return

    if (!commentData.comment.trim()) {
      toast.error('يرجى كتابة تعليق')
      return
    }

    if (commentData.rating < 1 || commentData.rating > 5) {
      toast.error('التقييم يجب أن يكون بين 1 و 5')
      return
    }

    try {
              const token = Cookies.get('teacher_token')

      const res = await fetch(`${API_URL}/student/${selectedStudent.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`

        },
        body: JSON.stringify(commentData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('تم إضافة التعليق والتقييم بنجاح')
        setShowCommentModal(false)
        setCommentData({ comment: '', rating: 5 })
        fetchStudents() // تحديث البيانات
      } else {
        toast.error(data.message || 'فشل في إضافة التعليق')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة التعليق')
    }
  }

  // إزالة طالب من الكورس
  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الطالب من الكورس؟')) return

    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/remove-student/${studentId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('تم إزالة الطالب من الكورس بنجاح')
        fetchStudents() // تحديث القائمة
      } else {
        toast.error(data.message || 'فشل في إزالة الطالب')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إزالة الطالب')
    }
  }

  // فتح نافذة التعليق
  const openCommentModal = (student: Student) => {
    setSelectedStudent(student)
    setCommentData({
      comment: student.comment || '',
      rating: student.rating || 5
    })
    setShowCommentModal(true)
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-gray-600 text-lg">جار تحميل بيانات الطلاب...</div>
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
        
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link 
            href={`/teacher/courses/${courseId}`} 
            className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:-translate-x-2 shadow-lg hover:shadow-xl border border-gray-200"
          >
            <FiArrowLeft className="ml-2" />
            العودة إلى الكورس
          </Link>

          <div className="text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-300 shadow-sm">
            <FiUsers className="inline ml-2" />
            {students.length} طالب
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">طلاب الكورس</h1>
              <p className="text-gray-600">إدارة الطلاب المسجلين في هذا الكورس</p>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
              <FiUsers className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <p className="text-2xl mb-4">لا يوجد طلاب مسجلين</p>
              <p className="text-lg text-gray-400">لم يسجل أي طالب في هذا الكورس بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div 
                  key={student.id} 
                  className="bg-white rounded-2xl p-6 hover:bg-gray-50 transition-all duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl border border-gray-200 group"
                >
                  {/* Student Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="relative">
                        <img 
                          src={student.image || '/default-avatar.png'} 
                          alt={student.name}
                          className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                          {student.name}
                        </h3>
                        <p className="text-gray-500 text-sm">QR: {student.qr_code}</p>
                      </div>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiMail className="ml-2 text-blue-500" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiPhone className="ml-2 text-green-500" />
                      <span>{student.phone}</span>
                    </div>

                    {student.birth_day && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <FiCalendar className="ml-2 text-purple-500" />
                        <span>{new Date(student.birth_day).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating and Comment */}
                  <div className="mb-4">
                    {student.rating ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar 
                                key={i}
                                className={`${
                                  i < student.rating! 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'
                                } ml-1`}
                                size={16}
                              />
                            ))}
                            <span className="text-green-700 font-medium mr-2">
                              ({student.rating})
                            </span>
                          </div>
                          {student.commented_at && (
                            <span className="text-green-600 text-xs">
                              {new Date(student.commented_at).toLocaleDateString('ar-EG')}
                            </span>
                          )}
                        </div>
                        {student.comment && (
                          <p className="text-green-800 text-sm leading-relaxed">
                             &quot;{student.comment}&quot;

                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 border border-gray-300 rounded-xl p-3 text-center">
                        <p className="text-gray-500 text-sm">    التقييم </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCommentModal(student)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-blue-500"
                    >
                      <FiMessageSquare />
                      {student.rating ? 'تعديل التقييم' : 'إضافة تقييم'}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-red-500"
                      title="إزالة من الكورس"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Modal */}
        {showCommentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 animate-scaleIn">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">تقييم الطالب</h2>
                <button 
                  onClick={() => setShowCommentModal(false)} 
                  className="text-gray-500 hover:text-gray-700 transition-all duration-300 transform hover:rotate-90 p-2 rounded-full hover:bg-gray-100"
                >
                  <FiArrowLeft size={20} />
                </button>
              </div>

              {/* Student Info */}
              <div className="flex items-center space-x-3 space-x-reverse mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <img 
                  src={selectedStudent.image || '/default-avatar.png'} 
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">التقييم</label>
                <div className="flex justify-center space-x-1 space-x-reverse">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentData(prev => ({ ...prev, rating: star }))}
                      className="transition-transform duration-200 transform hover:scale-125"
                    >
                      <FiStar 
                        className={`${
                          star <= commentData.rating 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300'
                        }`}
                        size={32}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-gray-600 text-sm">
                    {commentData.rating} من 5 نجوم
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">التعليق</label>
                <textarea
                  value={commentData.comment}
                  onChange={(e) => setCommentData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-50 border-2 border-gray-300 rounded-xl p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                  placeholder="اكتب تعليقك عن الطالب..."
                  maxLength={500}
                />
                <div className="text-gray-500 text-xs mt-1 text-left">
                  {commentData.comment.length}/500 حرف
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddComment}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-green-500"
                >
                  <FiStar />
                  حفظ التقييم
                </button>
                
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg border border-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0.8);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </Layout>
  )
}
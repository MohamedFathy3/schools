'use client'
import React, { useState, useEffect } from 'react'
import { FiEdit, FiSave, FiX, FiTrash2, FiPlus, FiVideo, FiFileText, FiArrowLeft, FiEye, FiDownload } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import Layout from '@/components/Layoutteacher'
import { useParams } from 'next/navigation'

interface CourseDetail {
  id: number
  course_id: string
  title: string
  description: string
  content_type: string
  content_link: string
  file_path: string
  created_at: string
}

interface Course {
  id: string
  title: string
}

function extractYouTubeID(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}


export default function CourseDetailsPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<CourseDetail>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDetail, setNewDetail] = useState({
    course_id: courseId || '',
    title: '',
    description: '',
    content_type: 'online',
    content_link: '',
    file: null as File | null
  })
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

 

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/course-detail/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           filters: { course_id: courseId },
          orderBy: "id",
          orderByDirection: "asc",
          perPage: 100,
          paginate: true,
          delete: false
        })
      })
      const data = await res.json()
      
      if (data.status === 200) {
        setCourseDetails(data.data || [])
      } else {
        toast.error('حدث خطأ في تحميل التفاصيل')
      }
    } catch (err) {
      toast.error('حدث خطأ في تحميل التفاصيل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseDetails()
  }, [])

  const handleEdit = (detail: CourseDetail) => {
    setEditingId(detail.id)
    setEditForm({ ...detail })
  }

  const handleSave = async (id: number) => {
    try {
      const payload = new FormData()
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value as string)
        }
      })

      const res = await fetch(`${API_URL}/course-detail/update/${id}`, {
        method: 'POST',
        body: payload
      })
      const data = await res.json()

      if (data.message === "Course detail updated successfully") {
        toast.success('تم التحديث بنجاح')
        setEditingId(null)
        fetchCourseDetails()
      } else {
        toast.error(data.message || 'فشل في التحديث')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء التحديث')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleAddDetail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = new FormData()
      Object.entries(newDetail).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'file' && value instanceof File) {
            payload.append(key, value)
          } else {
            payload.append(key, value as string)
          }
        }
      })

      const res = await fetch(`${API_URL}/course-detail`, {
        method: 'POST',
        body: payload
      })
      const data = await res.json()

      if (data.message === "Course detail added successfully") {
        toast.success('تم الإضافة بنجاح')
        setShowAddForm(false)
        setNewDetail({
          course_id: courseId || '',
          title: '',
          description: '',
          content_type: 'online',
          content_link: '',
          file: null
        })
        fetchCourseDetails()
      } else {
        toast.error(data.message || 'فشل في الإضافة')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التفصيل؟')) return

    try {
      const res = await fetch(`${API_URL}/course-detail/delete/${id}`, {
        method: 'POST'
      })
      const data = await res.json()

      if (data.message === "Course detail deleted successfully") {
        toast.success('تم الحذف بنجاح')
        fetchCourseDetails()
      } else {
        toast.error(data.message || 'فشل في الحذف')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

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
          <Link href="/teacher/courses" className="inline-flex items-center text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="ml-1" />
            العودة إلى قائمة الكورسات
          </Link>

          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="ml-2" />
            إضافة تفصيل جديد
          </button>
        </div>

        <div className="bg-gray-700 rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-6">تفاصيل الكورسات</h1>

          {courseDetails.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              لا توجد تفاصيل متاحة
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseDetails.map((detail) => (
                <div key={detail.id} className="bg-gray-600 rounded-xl p-4 hover:bg-gray-500 transition-colors">
                  {editingId === detail.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-500 rounded-lg p-2"
                        placeholder="العنوان"
                      />
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-500 rounded-lg p-2"
                        placeholder="الوصف"
                      />
                      <select
                        value={editForm.content_type || ''}
                        onChange={(e) => setEditForm({...editForm, content_type: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-500 rounded-lg p-2"
                      >
                        <option value="online">أونلاين</option>
                        <option value="recorded">مسجل</option>
                      </select>
                      <input
                        type="url"
                        value={editForm.content_link || ''}
                        onChange={(e) => setEditForm({...editForm, content_link: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-500 rounded-lg p-2"
                        placeholder="رابط المحتوى"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(detail.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center"
                        >
                          <FiSave className="ml-1" />
                          حفظ
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded-lg"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">{detail.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(detail)}
                            className="text-yellow-400 hover:text-yellow-300"
                            title="تعديل"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(detail.id)}
                            className="text-red-400 hover:text-red-300"
                            title="حذف"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{detail.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded ${
                          detail.content_type === 'online' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {detail.content_type === 'online' ? 'أونلاين' : 'مسجل'}
                        </span>
                        
                      {detail.content_link && (
  <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
    <iframe
      className="w-full h-full"
      src={`https://www.youtube.com/embed/${extractYouTubeID(detail.content_link)}`}
      title="YouTube video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
)}

                        
                        {detail.file_path && (
                          <a
                            href={detail.file_path}
                            download
                            className="text-green-400 hover:text-green-300 flex items-center"
                          >
                            <FiDownload className="ml-1" />
                            تحميل
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

 {showAddForm && (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">إضافة تفصيل جديد</h2>
        <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white transition">
          <FiX size={24} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleAddDetail} className="space-y-5">
        {/* العنوان */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">العنوان</label>
          <input
            type="text"
            value={newDetail.title}
            onChange={(e) => setNewDetail({...newDetail, title: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
            required
            placeholder="عنوان التفصيل"
          />
        </div>

        {/* الوصف */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
          <textarea
            value={newDetail.description}
            onChange={(e) => setNewDetail({...newDetail, description: e.target.value})}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
            required
            placeholder="وصف التفصيل"
          />
        </div>

        {/* نوع المحتوى */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">نوع المحتوى</label>
          <select
            value={newDetail.content_type}
            onChange={(e) => setNewDetail({...newDetail, content_type: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            required
          >
            <option value="">اختر نوع المحتوى</option>
            <option value="video">فيديو</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>

        {/* رابط المحتوى */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">رابط المحتوى</label>
          <input
            type="url"
            value={newDetail.content_link}
            onChange={(e) => setNewDetail({...newDetail, content_link: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
            placeholder="https://example.com"
          />
        </div>

        {/* رفع ملف */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">رفع ملف (اختياري)</label>
          <input
            type="file"
            onChange={(e) => setNewDetail({...newDetail, file: e.target.files?.[0] || null})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          />
        </div>

        {/* الأزرار */}
        <div className="flex gap-4 pt-4 justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center transition"
          >
            <FiPlus className="ml-2" />
            إضافة التفصيل
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>
    </Layout>
  )
}
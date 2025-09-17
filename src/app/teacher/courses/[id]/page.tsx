'use client';
import React, { useState, useEffect } from 'react'
import { FiArrowRight, FiVideo, FiFileText, FiDollarSign, FiUsers, FiEye, FiBook, FiDownload, FiArrowLeft, FiList } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import Layout from '@/components/Layoutteacher'
import Cookies from 'js-cookie'

interface Course {
  id: number
  title: string
  description: string
  type: string
  price: string
  discount: string
  original_price: string
  image: string
  views_count: number
  subscribers_count: number
  active: boolean
  content_link: string
  intro_video_url: string
  what_you_will_learn: string

  teacher: {
    id: number
    name: string
    image: string
  }
  stage: {
    id: number
    name: string
  }
  subject: {
    id: number
    name: string
  }
  country: {
    id: number
    name: string
  }
  details: Array<{
    id: number
    title: string
    content_type: string
    content_link: string
    file_path: string
    description: string
  }>
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  
function extractYouTubeID(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

  const fetchCourseDetails = async () => {
    try {
      const token = Cookies.get('teacher_token')

      const res = await fetch(`${API_URL}/course/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.status === 200) {
        setCourse(data.data)
      } else {
        toast.error('حدث خطأ في تحميل تفاصيل الكورس')
      }
    } catch (err) {
      toast.error('حدث خطأ في تحميل تفاصيل الكورس')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // فك الـ Promise باستخدام React.use()
    const id = params?.id
    if (id) {
      fetchCourseDetails()
    }
  }, [params?.id]) // استخدام params.id بعد فك الـ Promise

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-white">جار التحميل...</div>
        </div>
      </Layout>
    )
  }

  if (!course) {
    return (
      <Layout>
        <div className="p-6 bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-white">الكورس غير موجود</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen">
        <ToastContainer />
        <div className="mb-6 flex justify-between items-center">
          <Link href="/teacher/courses/" className="inline-flex items-center text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="ml-1" />
            العودة إلى قائمة الكورسات
          </Link>

          <div className="flex gap-4">
            <Link 
              href={`/teacher/courses/${course.id}/exams`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiBook className="ml-2" />
              الامتحانات
            </Link>
            <Link 
              href={`/teacher/courses/${course.id}/detail`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiList className="ml-2" />
              تفاصيل الكورس
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-700 rounded-2xl p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
              <img src={course.image} alt={course.title} className="w-full h-64 object-cover rounded-xl mb-4" />

              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">وصف الكورس</h2>
                <p className="text-gray-300">{course.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">ماذا سوف تتعلم</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <FiArrowRight className="text-green-500 mt-1 ml-2" />
                    <span>{course.what_you_will_learn}</span>
                  </div>
                </div>
              </div>

              {course.intro_video_url && (
                <div>
                  <h2 className="text-lg font-bold mb-2">الفيديو التعريفي</h2>
                  <div className="aspect-video bg-black rounded-lg">
                    <video 
                      src={course.intro_video_url} 
                      controls 
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4">معلومات الكورس</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">المعلم:</span>
                  <div className="flex items-center">
                    <img src={course.teacher.image} alt={course.teacher.name} className="w-6 h-6 rounded-full ml-2" />
                    <span>{course.teacher.name}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">المادة:</span>
                  <span>{course.subject.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">المرحلة:</span>
                  <span>{course.stage.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">البلد:</span>
                  <span>{course.country.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">النوع:</span>
                  <span className={course.type === 'free' ? 'text-green-500' : 'text-blue-500'}>
                    {course.type === 'free' ? 'مجاني' : 'مدفوع'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">السعر:</span>
                  <div className="flex items-center">
                    <FiDollarSign className="text-yellow-500 ml-1" />
                    <span>{course.price}</span>
                    {course.discount && (
                      <span className="text-red-500 line-through text-sm mr-2">{course.original_price}</span>
                    )}
                  </div>
                </div>

                {course.discount && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">الخصم:</span>
                    <span className="text-red-500">{course.discount}%</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">عدد المشاهدات:</span>
                  <div className="flex items-center">
                    <FiEye className="ml-1" />
                    <span>{course.views_count}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">عدد المشتركين:</span>
                  <div className="flex items-center">
                    <FiUsers className="ml-1" />
                    <span>{course.subscribers_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-6 rounded-2xl mt-6">
          <h2 className="text-2xl font-bold mb-6">محتويات الكورس</h2>
          <div className="space-y-6">
            {course.details.map((detail, index) => (
              <div key={detail.id} className="flex justify-between items-center p-4 bg-gray-600 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center ml-3 mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{detail.title}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-4">
                      {detail.content_type === 'video' ? (
                        <>
                          {course.intro_video_url && (
                            <div>
                              <h2 className="text-lg font-bold mb-2">الفيديو التعريفي</h2>
                              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                <iframe
                                  className="w-full h-full"
                                  src={`https://www.youtube.com/embed/${extractYouTubeID(course.intro_video_url)}`}
                                  title="YouTube video"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <FiFileText className="ml-1" size={14} /> ملف
                        </>
                      )}
                      {detail.description && <span className="mr-2">• {detail.description}</span>}
                    </div>
                  </div>
                </div>
                
                <div>
                  {detail.content_type === 'video' ? (
                    <a 
                      href={detail.content_link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FiVideo className="ml-1" />
                      مشاهدة
                    </a>
                  ) : (
                    <a 
                      href={detail.file_path || '#'} 
                      download
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FiDownload className="ml-1" />
                      تحميل
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

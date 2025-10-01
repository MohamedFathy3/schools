'use client';
import React, { useState, useEffect } from 'react'
import { 
  FiArrowRight, FiVideo, FiFileText, FiDollarSign, FiUsers, 
  FiEye, FiBook, FiDownload, FiArrowLeft, FiList, FiPlay,
  FiClock, FiStar, FiGlobe, FiUser, FiBarChart2, FiHeart,
  FiCalendar, FiExternalLink
} from 'react-icons/fi'
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
  created_at: string
  duration: string

  teacher: {
    id: number
    name: string
    image: string
    bio: string
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
    duration: string
    order: number
    session_date?: string
    session_time?: string
  }>
}

// Video Modal Component
const VideoModal = ({ isOpen, onClose, videoUrl, title }: { 
  isOpen: boolean; 
  onClose: () => void; 
  videoUrl: string; 
  title: string 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-gray-900 rounded-3xl overflow-hidden animate-scaleIn border-2 border-blue-500 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-blue-700 bg-gradient-to-r from-blue-800 to-blue-900">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <FiPlay className="text-red-500" />
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-300 transform hover:rotate-90 hover:scale-110"
          >
            <div className="w-10 h-10 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center border border-blue-600">
              <span className="text-xl font-bold">×</span>
            </div>
          </button>
        </div>
        
        <div className="p-2 bg-black">
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${extractYouTubeID(videoUrl)}`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// دالة محسنة لاستخراج YouTube ID
function extractYouTubeID(url: string): string | null {
  if (!url) return null;
  
  // لروابط YouTube العادية
  const standardRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const standardMatch = url.match(standardRegex);
  if (standardMatch) return standardMatch[1];
  
  // لروابط YouTube Live
  const liveRegex = /youtube\.com\/live\/([^"&?\/\s]{11})/;
  const liveMatch = url.match(liveRegex);
  if (liveMatch) return liveMatch[1];
  
  // لروابط YouTube مع معلمات
  const paramsRegex = /youtube\.com\/watch\?.*v=([^"&?\/\s]{11})/;
  const paramsMatch = url.match(paramsRegex);
  if (paramsMatch) return paramsMatch[1];
  
  return null;
}

// دالة لعرض محتوى الكورس
const renderCourseContent = (detail: Course['details'][0]) => {
  const isZoom = detail.content_type === 'zoom';
  const isVideo = detail.content_type === 'video';
  const hasFile = detail.file_path;

  return (
    <div className="space-y-4 mt-4">
      {/* محتوى Zoom */}
      {isZoom && detail.content_link && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 border-2 border-blue-500 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <FiVideo className="text-white text-xl" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">جلسة Zoom مباشرة</h4>
                <p className="text-blue-200 text-sm">انضم إلى الجلسة الحية</p>
              </div>
            </div>
            <button
              onClick={() => window.open(detail.content_link, '_blank', 'noopener,noreferrer')}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              <FiExternalLink />
              انضم الآن
            </button>
          </div>
          
          {(detail.session_date || detail.session_time) && (
            <div className="flex flex-wrap gap-4 text-blue-200 text-sm bg-blue-800/50 rounded-xl p-4">
              {detail.session_date && (
                <div className="flex items-center gap-2 bg-blue-700/50 px-3 py-2 rounded-lg">
                  <FiCalendar className="text-blue-300" />
                  <span>التاريخ: {detail.session_date}</span>
                </div>
              )}
              {detail.session_time && (
                <div className="flex items-center gap-2 bg-blue-700/50 px-3 py-2 rounded-lg">
                  <FiClock className="text-blue-300" />
                  <span>الوقت: {detail.session_time}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* محتوى فيديو */}
      {isVideo && detail.content_link && (
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl overflow-hidden border-2 border-gray-500 shadow-lg">
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${extractYouTubeID(detail.content_link)}`}
              title={detail.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4 bg-gray-800 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FiVideo className="text-red-400 text-xl" />
              <span className="text-white font-semibold">فيديو تعليمي</span>
            </div>
          
          </div>
        </div>
      )}

      {/* ملفات مرفقة */}
      {hasFile && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 border-2 border-green-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <FiFileText className="text-white text-xl" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">{getFileName(detail.file_path)}</div>
                <div className="text-green-200 text-sm">
                  {getFileExtension(detail.file_path).toUpperCase()} ملف - يمكنك تحميله الآن
                </div>
              </div>
            </div>
            <a
              href={detail.file_path}
              download
              className="bg-white hover:bg-gray-100 text-green-600 px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
            >
              <FiDownload />
              تحميل الملف
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// دوال مساعدة
function getFileName(path: string): string {
  return path.split('/').pop() || 'ملف';
}

function getFileExtension(path: string): string {
  return path.split('.').pop()?.toLowerCase() || 'file';
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string} | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const API_URL = '/api';

  const fetchCourseDetails = async () => {
    try {
      const token = Cookies.get('teacher_token')
      const res = await fetch(`${API_URL}/course/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.status === 200) {
        setCourse(data.data)
        toast.success('تم تحميل تفاصيل الكورس بنجاح', {
          icon: '🎓'
        })
      } else {
        toast.error('حدث خطأ في تحميل تفاصيل الكورس')
      }
    } catch (err) {
      toast.error('حدث خطأ في تحميل تفاصيل الكورس')
    } finally {
      setLoading(false)
    }
  }

  const openVideoModal = (videoUrl: string, title: string) => {
    setSelectedVideo({ url: videoUrl, title })
    setIsVideoModalOpen(true)
  }

  useEffect(() => {
    const id = params?.id
    if (id) {
      fetchCourseDetails()
    }
  }, [params?.id])

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-white text-lg">جار التحميل...</div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!course) {
    return (
      <Layout>
        <div className="p-6 bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">الكورس غير موجود</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen">
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
          theme="dark"
          toastClassName="rounded-2xl shadow-2xl"
          progressClassName="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        
        {/* Header Navigation */}
        <div className="mb-8 flex justify-between items-center animate-fadeIn">
          <Link 
            href="/teacher/courses/" 
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
          >
            <FiArrowLeft className="ml-2" />
            العودة إلى الكورسات
          </Link>

          <div className="flex gap-3">
            <Link 
              href={`/teacher/courses/${course.id}/exams`}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-2xl flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <FiBook className="ml-2" />
              الامتحانات
            </Link>
            <Link 
              href={`/teacher/courses/${course.id}/detail`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <FiList className="ml-2" />
              إدارة المحتوى
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 animate-slideUp">
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex flex-wrap items-end justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-gray-300 text-lg mb-6 max-w-3xl leading-relaxed">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-white bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <FiUser className="ml-2 text-blue-400" />
                    <span className="font-medium">{course.teacher.name}</span>
                  </div>
                  <div className="flex items-center text-white bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <FiBook className="ml-2 text-green-400" />
                    <span className="font-medium">{course.subject.name}</span>
                  </div>
                  <div className="flex items-center text-white bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <FiStar className="ml-2 text-yellow-400" />
                    <span className="font-medium">{course.stage?.name}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-4 mt-4 lg:mt-0">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/30 min-w-24 transform hover:scale-105 transition-all duration-300">
                  <FiEye className="text-blue-300 text-2xl mx-auto mb-2" />
                  <div className="text-white font-bold text-xl">{course.views_count}</div>
                  <div className="text-blue-200 text-sm">مشاهدة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/30 min-w-24 transform hover:scale-105 transition-all duration-300">
                  <FiUsers className="text-green-300 text-2xl mx-auto mb-2" />
                  <div className="text-white font-bold text-xl">{course.subscribers_count}</div>
                  <div className="text-green-200 text-sm">مشترك</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - 3/4 width */}
          <div className="xl:col-span-3 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-8 animate-fadeIn border border-gray-600 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
                <FiArrowRight className="ml-2 text-green-400" />
                ماذا سوف تتعلم في هذا الكورس
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.what_you_will_learn.split('\n').map((item, index) => (
                  <div key={index} className="flex items-start group hover:transform hover:translate-x-2 transition-all duration-300">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ml-3 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/30">
                      <FiArrowRight className="text-white text-sm" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                      {item.trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-8 animate-fadeIn border border-gray-600 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">محتويات الكورس</h2>
                <div className="text-gray-400 flex items-center bg-gray-600 px-4 py-2 rounded-xl">
                  <FiVideo className="ml-2" />
                  <span>{course.details.length} محتوى</span>
                </div>
              </div>

              <div className="space-y-6">
                {course.details.map((detail, index) => (
                  <div 
                    key={detail.id} 
                    className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-6 hover:from-gray-500 hover:to-gray-600 transition-all duration-500 group border-2 border-gray-500 hover:border-blue-400 shadow-lg hover:shadow-2xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center ml-4 flex-shrink-0 group-hover:bg-gray-600 transition-colors duration-300 shadow-lg">
                          {detail.content_type === 'video' ? (
                            <FiVideo className="text-red-400 text-2xl" />
                          ) : detail.content_type === 'zoom' ? (
                            <FiVideo className="text-green-400 text-2xl" />
                          ) : (
                            <FiFileText className="text-blue-400 text-2xl" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-xl mb-2 group-hover:text-blue-300 transition-colors duration-300">
                            {detail.title}
                          </h3>
                          <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              detail.content_type === 'video' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : detail.content_type === 'zoom'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {detail.content_type === 'video' ? 'فيديو' : 
                               detail.content_type === 'zoom' ? 'جلسة Zoom' : 'ملف'}
                            </span>
                            {detail.duration && (
                              <span className="flex items-center bg-gray-500/30 px-2 py-1 rounded-lg">
                                <FiClock className="ml-1" size={12} />
                                {detail.duration}
                              </span>
                            )}
                          </div>
                          {detail.description && (
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {detail.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* عرض المحتوى حسب النوع */}
                    {renderCourseContent(detail)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 animate-slideUp border border-blue-500 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-blue-500 pb-4">
                📊 معلومات الكورس
              </h2>

              <div className="space-y-5">
                <div className="flex justify-between items-center py-2 border-b border-blue-500/50">
                  <span className="text-blue-200 flex items-center">
                    <FiDollarSign className="ml-1 text-yellow-300" />
                    السعر:
                  </span>
                  <div className="flex items-center">
                    <span className="text-white font-bold text-lg">{course.price} ج.م</span>
                    {course.discount && (
                      <span className="text-red-300 line-through text-sm mr-2">
                        {course.original_price} ج.م
                      </span>
                    )}
                  </div>
                </div>

                {course.discount && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-500/50">
                    <span className="text-blue-200">الخصم:</span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {course.discount}%
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-blue-500/50">
                  <span className="text-blue-200">النوع:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    course.type === 'free' 
                      ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                      : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  } shadow-lg`}>
                    {course.type === 'free' ? '🆓 مجاني' : '💰 مدفوع'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-blue-500/50">
                  <span className="text-blue-200 flex items-center">
                    <FiGlobe className="ml-1 text-green-300" />
                    البلد:
                  </span>
                  <span className="text-white font-medium">{course.country.name}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-200 flex items-center">
                    <FiBarChart2 className="ml-1 text-purple-300" />
                    الحالة:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    course.active 
                      ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                      : 'bg-red-500/30 text-red-300 border border-red-500/50'
                  } shadow-lg`}>
                    {course.active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>

            {/* Teacher Info Card */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-6 animate-slideUp border border-gray-600 shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">👨‍🏫 المعلم</h2>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <img 
                  src={course.teacher.image} 
                  alt={course.teacher.name}
                  className="w-16 h-16 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div>
                  <div className="text-white font-bold text-lg">{course.teacher.name}</div>
                  <div className="text-gray-400 text-sm">مدرس متخصص</div>
                </div>
              </div>
              {course.teacher.bio && (
                <p className="text-gray-300 text-sm leading-relaxed bg-gray-600/50 p-3 rounded-xl">
                  {course.teacher.bio}
                </p>
              )}
            </div>

            {/* Intro Video Card */}
            {course.intro_video_url && (
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 animate-slideUp border border-red-500 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">🎬 الفيديو التعريفي</h2>
                <div 
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => openVideoModal(course.intro_video_url, 'الفيديو التعريفي')}
                >
                  <img 
                    src={course.image} 
                    alt="الفيديو التعريفي"
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300">
                    <div className="bg-red-600 group-hover:bg-red-700 text-white p-4 rounded-full transform group-hover:scale-110 transition-all duration-300 shadow-2xl">
                      <FiPlay size={24} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-sm font-medium">انقر للمشاهدة</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={selectedVideo?.url || ''}
          title={selectedVideo?.title || ''}
        />

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.5s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </Layout>
  )
}
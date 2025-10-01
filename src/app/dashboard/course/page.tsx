'use client'
import React, { useState, useEffect } from 'react'
import { 
  FiEye, FiSearch, FiDollarSign, FiUsers, FiBook, 
  FiChevronRight, FiChevronLeft, FiPlay, FiClock,
  FiBarChart2, FiStar, FiGlobe, FiUser
} from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from '@/components/Layout'
import { courseApi, Course, CoursesResponse } from '@/lib/courseApi'

// Modal Component لعرض التفاصيل
const CourseDetailsModal = ({ 
  course, 
  isOpen, 
  onClose 
}: { 
  course: Course | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!isOpen || !course) return null


function getVideoType(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else {
    return 'direct';
  }
}

// دالة لاستخراج YouTube ID
function getYouTubeId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// دالة لاستخراج Vimeo ID
function getVimeoId(url: string) {
  const regex = /vimeo\.com\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}






return (
  <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{course.title}</h2>
          <p className="text-gray-300 text-lg">{course.description}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-all duration-300 transform hover:rotate-90"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xl">×</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* الفيديو والإحصائيات */}
     <div className="space-y-6">
  {course.intro_video_url ? (
    (() => {
      const videoType = getVideoType(course.intro_video_url);
      
      switch (videoType) {
        case 'youtube':
          const youtubeId = getYouTubeId(course.intro_video_url);
          return (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-64"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="فيديو تعريفي للكورس"
              />
            </div>
          );
        
        case 'vimeo':
          const vimeoId = getVimeoId(course.intro_video_url);
          return (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                className="w-full h-64"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="فيديو تعريفي للكورس"
              />
            </div>
          );
        
        default:
          return (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video 
                className="w-full h-64 object-cover"
                controls
                controlsList="nodownload"
                poster={course.image}
                preload="metadata"
              >
                <source src={course.intro_video_url} type="video/mp4" />
                <source src={course.intro_video_url} type="video/webm" />
                المتصفح لا يدعم تشغيل الفيديو
              </video>
            </div>
          );
      }
    })()
  ) : (
    // عرض الصورة فقط إذا مافيش فيديو
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      <img 
        src={course.image} 
        alt={course.title}
        className="w-full h-64 object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-gray-700 bg-opacity-70 text-white p-4 rounded-full">
          <FiPlay size={24} className="opacity-60" />
        </div>
      </div>
    </div>
  )}

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-xl p-4 text-center hover:bg-gray-600 transition-all duration-300 transform hover:scale-105">
              <FiUsers className="text-blue-400 text-2xl mx-auto mb-2" />
              <div className="text-white font-bold text-xl">{course.subscribers_count}</div>
              <div className="text-gray-400 text-sm">مشترك</div>
            </div>
            <div className="bg-gray-700 rounded-xl p-4 text-center hover:bg-gray-600 transition-all duration-300 transform hover:scale-105">
              <FiBarChart2 className="text-green-400 text-2xl mx-auto mb-2" />
              <div className="text-white font-bold text-xl">{course.views_count}</div>
              <div className="text-gray-400 text-sm">مشاهدة</div>
            </div>
          </div>
        </div>

        {/* التفاصيل */}
        <div className="space-y-6">
          {/* معلومات المعلم */}
          <div className="bg-gray-700 rounded-2xl p-6 hover:bg-gray-600 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FiUser className="ml-2 text-blue-400" />
              معلومات المعلم
            </h3>
            <div className="flex items-center space-x-3 space-x-reverse">
              <img 
                src={course.teacher.image} 
                alt={course.teacher.name}
                className="w-16 h-16 rounded-full border-2 border-blue-400"
              />
              <div>
                <div className="text-white font-bold text-lg">{course.teacher.name}</div>
                <div className="text-gray-300">مدرس متخصص</div>
              </div>
            </div>
          </div>

          {/* معلومات الكورس */}
          <div className="bg-gray-700 rounded-2xl p-6 hover:bg-gray-600 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-4">معلومات الكورس</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-yellow-400">
                <FiDollarSign className="ml-2" />
                <span>السعر: {course.price} جنيه</span>
              </div>
              <div className="flex items-center text-green-400">
                <FiGlobe className="ml-2" />
                <span>{course.country.name}</span>
              </div>
              <div className="flex items-center text-blue-400">
                <FiBook className="ml-2" />
                <span>{course.subject.name}</span>
              </div>
              <div className="flex items-center text-purple-400">
                <FiStar className="ml-2" />
                <span>{course.stage?.name}</span>
              </div>
            </div>
          </div>

          {/* ماذا سوف تتعلم */}
          {course.details.length > 0 && (
            <div className="bg-gray-700 rounded-2xl p-6 hover:bg-gray-600 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-4">ماذا سوف تتعلم</h3>
              <div className="grid gap-2">
                {course.details.map((detail, index) => (
                  <div 
                    key={detail.id}
                    className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full ml-3"></div>
                    {detail.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)
}

// Toggle Switch Component
const ToggleSwitch = ({ 
  active, 
  onToggle, 
  courseId 
}: { 
  active: boolean
  onToggle: (courseId: number, newStatus: boolean) => void
  courseId: number
}) => {
  const handleToggle = async () => {
    try {
      await onToggle(courseId, !active)
    } catch (error) {
      // لا تعمل شيء - الخطأ بيتعامل معاه في الدالة الأساسية
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-500 ${
        active ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30' : 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-inner'
      } transform hover:scale-105 active:scale-95`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-lg transition-all duration-500 ${
          active ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center space-x-2 space-x-reverse mt-8 animate-fadeIn">
      {/* زر السابق */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-3 rounded-xl transition-all duration-300 ${
          currentPage === 1 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:scale-105 shadow-lg'
        }`}
      >
        <FiChevronRight size={20} />
      </button>

      {/* أرقام الصفحات */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
            page === currentPage
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 scale-110'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-105'
          }`}
        >
          {page}
        </button>
      ))}

      {/* زر التالي */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-3 rounded-xl transition-all duration-300 ${
          currentPage === totalPages
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:scale-105 shadow-lg'
        }`}
      >
        <FiChevronLeft size={20} />
      </button>
    </div>
  )
}

export default function CoursesPage() {
  const [coursesData, setCoursesData] = useState<CoursesResponse>({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // ✅ جلب الكورسات
  const fetchCourses = async (page: number = 1) => {
    try {
      const data = await courseApi.getCourses(page, 5)
      setCoursesData(data)
    } catch (err) {
      toast.error('حدث خطأ في تحميل الكورسات')
      console.error('Fetch courses error:', err)
    }
  }

  // ✅ تبديل حالة الكورس
  const toggleActive = async (courseId: number, newStatus: boolean) => {
    const originalCourses = [...coursesData.data]
    
    // تحديث فوري في الـ UI
    setCoursesData(prev => ({
      ...prev,
      data: prev.data.map(c => 
        c.id === courseId ? { ...c, active: newStatus } : c
      )
    }))
    
    try {
      await courseApi.toggleActive(courseId, newStatus)
      toast.success(`تم ${newStatus ? 'تفعيل' : 'إيقاف'} الكورس بنجاح ✅`)
    } catch (err) {
      // الرجوع للحالة الأصلية إذا فشل الطلب
      setCoursesData(prev => ({
        ...prev,
        data: originalCourses
      }))
      toast.error('فشل في تحديث حالة الكورس ❌')
    }
  }

  // ✅ فتح تفاصيل الكورس
  const openCourseDetails = (course: Course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  // ✅ تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchCourses(page)
  }

  // ✅ البحث
  const filteredCourses = coursesData.data.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchCourses(currentPage)
  }, [])

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen">
        <ToastContainer
          position="top-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              إدارة الكورسات
            </h1>
            <p className="text-gray-400">
              عرض {coursesData.data.length} من أصل {coursesData.total} كورس
            </p>
          </div>
          
          <div className="relative">
            <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن كورس، معلم، أو مادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-2 border-gray-600 text-white p-4 rounded-2xl pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 w-80 focus:shadow-lg focus:shadow-blue-500/20"
            />
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-gray-700 rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-600 to-gray-700">
           <tr>
  <th className="p-6 text-right font-bold text-lg">Course</th>
  <th className="p-6 text-right font-bold text-lg">Teacher</th>
  <th className="p-6 text-right font-bold text-lg">Subject</th>
  <th className="p-6 text-right font-bold text-lg">Level</th>
  <th className="p-6 text-right font-bold text-lg">Price</th>
  <th className="p-6 text-right font-bold text-lg">Subscribers</th>
  <th className="p-6 text-right font-bold text-lg">Views</th>
  <th className="p-6 text-right font-bold text-lg">Status</th>
  <th className="p-6 text-right font-bold text-lg">Details</th>
</tr>

              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr 
                    key={course.id} 
                    className="border-t border-gray-600 hover:bg-gray-600 transition-all duration-500 group animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="p-6">
                      <div className="flex items-center space-x-4 space-x-reverse group-hover:transform group-hover:translate-x-2 transition-transform duration-300">
                    
                        <div>
                          <div className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors duration-300">
                            {course.title}
                          </div>
                          <div className={`text-sm font-medium ${
                            course.type === 'free' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {course.type === 'free' ? '🆓 مجاني' : '💰 مدفوع'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <img 
                          src={course.teacher.image} 
                          alt={course.teacher.name}
                          className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg"
                        />
                        <span className="text-white font-medium">{course.teacher.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl font-medium text-center">
                        {course.subject.name}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-xl font-medium text-center">
                        {course.stage?.name || 'Public'}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center text-yellow-400 font-bold text-lg">
                        <FiDollarSign className="ml-1" />
                        {course?.price}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center text-blue-400 font-bold text-lg">
                        <FiUsers className="ml-1" />
                        {course?.subscribers_count}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center text-green-400 font-bold text-lg">
                        <FiBarChart2 className="ml-1" />
                        {course.views_count}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <ToggleSwitch 
                          active={course.active} 
                          onToggle={toggleActive}
                          courseId={course.id}
                        />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => openCourseDetails(course)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
                          title="عرض التفاصيل"
                        >
                          <FiEye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {coursesData.last_page > 1 && (
          <Pination 
            currentPage={coursesData.current_page}
            totalPages={coursesData.last_page}
            onPageChange={handlePageChange}
          />
        )}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="bg-gray-700 rounded-3xl p-16 text-center animate-fadeIn mt-8">
            <FiBook className="text-8xl text-gray-500 mx-auto mb-6 opacity-50" />
            <p className="text-gray-300 text-2xl font-light">لا توجد كورسات تطابق معايير البحث</p>
          </div>
        )}

        {/* Modal */}
        <CourseDetailsModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.5s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out;
          }
        `}</style>
      </div>
    </Layout>
  )
}
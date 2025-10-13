'use client'
import React, { useState, useEffect } from 'react'
import { 
  FiEye, FiSearch, FiDollarSign, FiUsers, FiBook, 
  FiChevronRight, FiChevronLeft, FiPlay, FiClock,
  FiBarChart2, FiStar, FiGlobe, FiUser, FiToggleLeft,
  FiToggleRight, FiEdit2, FiTrash2
} from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
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

  function getYouTubeId(url: string) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  function getVimeoId(url: string) {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <span className="text-xl">×</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الفيديو والإحصائيات */}
          <div className="space-y-4">
            {course.intro_video_url ? (
              (() => {
                const videoType = getVideoType(course.intro_video_url);
                
                switch (videoType) {
                  case 'youtube':
                    const youtubeId = getYouTubeId(course.intro_video_url);
                    return (
                      <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          className="w-full h-48"
                          frameBorder="0"
                          allowFullScreen
                          title="Course introduction video"
                        />
                      </div>
                    );
                  
                  case 'vimeo':
                    const vimeoId = getVimeoId(course.intro_video_url);
                    return (
                      <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
                        <iframe
                          src={`https://player.vimeo.com/video/${vimeoId}`}
                          className="w-full h-48"
                          frameBorder="0"
                          allowFullScreen
                          title="Course introduction video"
                        />
                      </div>
                    );
                  
                  default:
                    return (
                      <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
                        <video 
                          className="w-full h-48 object-cover"
                          controls
                          controlsList="nodownload"
                          poster={course.image}
                        >
                          <source src={course.intro_video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                }
              })()
            ) : (
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white bg-opacity-80 text-gray-700 p-3 rounded-full">
                    <FiPlay size={20} />
                  </div>
                </div>
              </div>
            )}

            {/* الإحصائيات */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <FiUsers className="text-blue-600 text-xl mx-auto mb-1" />
                <div className="text-gray-900 font-bold">{course.subscribers_count}</div>
                <div className="text-gray-600 text-sm">Subscribers</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                <FiBarChart2 className="text-green-600 text-xl mx-auto mb-1" />
                <div className="text-gray-900 font-bold">{course.views_count}</div>
                <div className="text-gray-600 text-sm">Views</div>
              </div>
            </div>
          </div>

          {/* التفاصيل */}
          <div className="space-y-4">
            {/* معلومات المعلم */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiUser className="ml-2 text-blue-600" />
                Teacher Information
              </h3>
              <div className="flex items-center space-x-3">
                <img 
                  src={course.teacher.image} 
                  alt={course.teacher.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
                <div>
                  <div className="text-gray-900 font-semibold">{course.teacher.name}</div>
                  <div className="text-gray-600 text-sm">Professional Teacher</div>
                </div>
              </div>
            </div>

            {/* معلومات الكورس */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center text-yellow-600">
                  <FiDollarSign className="ml-2" />
                  <span className="text-gray-700">Price: {course.price} EGP</span>
                </div>
                <div className="flex items-center text-green-600">
                  <FiGlobe className="ml-2" />
                  <span className="text-gray-700">{course.country.name}</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <FiBook className="ml-2" />
                  <span className="text-gray-700">{course.subject.name}</span>
                </div>
                <div className="flex items-center text-purple-600">
                  <FiStar className="ml-2" />
                  <span className="text-gray-700">{course.stage?.name || 'General'}</span>
                </div>
              </div>
            </div>

            {/* ماذا سوف تتعلم */}
            {course.details.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What You ll Learn</h3>
                <div className="space-y-2">
                  {course.details.map((detail) => (
                    <div 
                      key={detail.id}
                      className="flex items-center text-gray-700"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
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
  return (
    <button
      onClick={() => onToggle(courseId, !active)}
      className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all duration-300 ${
        active ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-lg transition-all duration-300 ${
          active ? 'translate-x-7' : 'translate-x-1'
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

const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

// إذا كان endPage مش بيتغير في الـ if condition، احذف الكود ده
/*
if (endPage - startPage + 1 < maxVisiblePages) {
  startPage = Math.max(1, endPage - maxVisiblePages + 1)
}
*/

for (let i = startPage; i <= endPage; i++) {
  pages.push(i)
}

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <FiChevronRight size={18} />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <FiChevronLeft size={18} />
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

  const fetchCourses = async (page: number = 1) => {
    try {
      const data = await courseApi.getCourses(page, 5)
      setCoursesData(data)
    } catch (err) {
      toast.error('Failed to load courses')
      console.error('Fetch courses error:', err)
    }
  }

  const toggleActive = async (courseId: number, newStatus: boolean) => {
    const originalCourses = [...coursesData.data]
    
    setCoursesData(prev => ({
      ...prev,
      data: prev.data.map(c => 
        c.id === courseId ? { ...c, active: newStatus } : c
      )
    }))
    
    try {
      await courseApi.toggleActive(courseId, newStatus)
      toast.success(`Course ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      setCoursesData(prev => ({
        ...prev,
        data: originalCourses
      }))
      toast.error('Failed to update course status')
    }
  }

  const openCourseDetails = (course: Course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchCourses(page)
  }

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
      <div className="min-h-screen bg-gray-50">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
        />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses Management</h1>
                <p className="text-gray-600">
                  Showing {coursesData.data.length} of {coursesData.total} courses
                </p>
              </div>
              
              <div className="relative">
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, teachers, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 p-3 rounded-xl pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Courses Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subscribers</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr 
                      key={course.id} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                        
                          <div>
                            <div className="font-semibold text-gray-900">
                              {course.title}
                            </div>
                            <div className={`text-xs font-medium ${
                              course.type === 'free' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {course.type === 'free' ? 'Free' : 'Paid'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                    
                          <span className="text-gray-700">{course.teacher.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {course.subject.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {course.stage?.name || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-900 font-semibold">
                          <FiDollarSign className="ml-1 text-yellow-600" />
                          {course.price}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700">
                          <FiUsers className="ml-1 text-blue-600" />
                          {course.subscribers_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700">
                          <FiBarChart2 className="ml-1 text-green-600" />
                          {course.views_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <ToggleSwitch 
                            active={course.active} 
                            onToggle={toggleActive}
                            courseId={course.id}
                          />
                          <span className={`text-sm font-medium ${
                            course.active ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {course.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openCourseDetails(course)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
                            title="View details"
                          >
                            <FiEye size={16} />
                          </button>
                       
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <FiBook className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No courses found matching your search</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {coursesData.last_page > 1 && (
            <Pagination 
              currentPage={coursesData.current_page}
              totalPages={coursesData.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Modal */}
        <CourseDetailsModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </Layout>
  )
}
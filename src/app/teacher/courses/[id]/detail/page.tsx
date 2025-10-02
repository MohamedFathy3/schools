'use client'
import React, { useState, useEffect } from 'react'
import { FiEdit, FiSave, FiX, FiTrash2, FiPlus, FiVideo, FiFileText, FiArrowLeft, FiEye, FiDownload, FiCalendar, FiClock, FiPlay, FiExternalLink, FiYoutube, FiFilm, FiLink } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
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
  file: string
  created_at: string
  session_date?: string
  session_time?: string
  file_path?: string
}

interface Course {
  id: string
  title: string
}

interface FileWithPreview {
  file: File
  preview: string
}

// Video Modal Component - محسن
const VideoModal = ({ isOpen, onClose, videoUrl, title, detail }: { 
  isOpen: boolean; 
  onClose: () => void; 
  videoUrl: string; 
  title: string;
  detail: CourseDetail;
}) => {
  if (!isOpen) return null;

  const videoType = getVideoType(videoUrl);
  const isZoomLink = videoUrl.includes('zoom.us');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden animate-scaleIn border border-gray-600 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              {isZoomLink ? <FiLink className="text-white text-xl" /> : 
               videoType === 'youtube' ? <FiYoutube className="text-white text-xl" /> : 
               <FiFilm className="text-white text-xl" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-gray-300 text-sm mt-1">
                {isZoomLink ? 'رابط Zoom' : 
                 videoType === 'youtube' ? 'فيديو YouTube' : 
                 videoType === 'vimeo' ? 'فيديو Vimeo' : 'فيديو مباشر'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-300 transform hover:rotate-90 p-2 rounded-full hover:bg-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-2 bg-black">
          {isZoomLink ? (
            <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex flex-col items-center justify-center p-8">
              <div className="text-6xl mb-4">🔗</div>
              <h4 className="text-2xl font-bold text-white mb-2">رابط Zoom</h4>
              <p className="text-gray-300 mb-6 text-center">سيتم فتح رابط Zoom في نافذة جديدة</p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    window.open(videoUrl, '_blank', 'noopener,noreferrer');
                    onClose();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <FiExternalLink />
                  فتح رابط Zoom
                </button>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : videoType === 'youtube' ? (
            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : videoType === 'vimeo' ? (
            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://player.vimeo.com/video/${getVimeoId(videoUrl)}`}
                title={title}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-black">
              <video 
                className="w-full h-full"
                controls
                controlsList="nodownload"
                autoPlay
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                المتصفح لا يدعم تشغيل الفيديو
              </video>
            </div>
          )}
        </div>

        {/* تفاصيل المحتوى */}
        <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-3">تفاصيل المحتوى</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="font-medium text-gray-400">النوع:</span>
              <span className="bg-blue-600/30 px-2 py-1 rounded-md text-blue-300">
                {detail.content_type === 'video' ? 'فيديو' : 'Zoom'}
              </span>
            </div>
            
            {detail.session_date && (
              <div className="flex items-center gap-2 text-gray-300">
                <span className="font-medium text-gray-400">التاريخ:</span>
                <span className="flex items-center gap-1 bg-purple-600/30 px-2 py-1 rounded-md text-purple-300">
                  <FiCalendar size={14} />
                  {detail.session_date}
                </span>
              </div>
            )}
            
            {detail.session_time && (
              <div className="flex items-center gap-2 text-gray-300">
                <span className="font-medium text-gray-400">الوقت:</span>
                <span className="flex items-center gap-1 bg-green-600/30 px-2 py-1 rounded-md text-green-300">
                  <FiClock size={14} />
                  {formatTimeForAPI(detail.session_time)}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-300">
              <span className="font-medium text-gray-400">تم الإنشاء:</span>
              <span>{new Date(detail.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
          
          {detail.description && (
            <div className="mt-4">
              <span className="font-medium text-gray-400 block mb-1">الوصف:</span>
              <p className="text-gray-300 text-sm leading-relaxed">{detail.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// الدوال المساعدة المحسنة
function getVideoType(url: string) {
  if (!url) return 'unknown';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else if (url.includes('zoom.us')) {
    return 'zoom';
  } else if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
    return 'direct';
  } else if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
    return 'file';
  } else {
    return 'unknown';
  }
}

// دالة محسنة لاستخراج YouTube ID
function getYouTubeId(url: string): string | null {
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

function getVimeoId(url: string): string | null {
  const regex = /vimeo\.com\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getFileName(path: string): string {
  return path.split('/').pop() || 'ملف';
}

function getFileExtension(path: string): string {
  return path.split('.').pop()?.toLowerCase() || 'file';
}

// دالة لتحويل الوقت من HH:MM:SS إلى HH:MM
const formatTimeForAPI = (time: string): string => {
  if (!time) return '';
  // إذا الوقت بصيغة HH:MM:SS نحوله إلى HH:MM
  if (time.includes(':')) {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`; // نأخذ الساعات والدقائق فقط
  }
  return time;
};

// دالة لمعالجة روابط Zoom
const handleZoomLink = (url: string, title: string) => {
  if (url.includes('zoom.us')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.info('جاري فتح رابط Zoom في نافذة جديدة', {
      icon: <span>🔗</span>
    });
  } else {
    // إذا الرابط مش Zoom نفتحه في تاب جديد
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// دالة محسنة لعرض المحتوى
// دالة محسنة لعرض المحتوى
const renderContent = (detail: CourseDetail) => {
  const videoType = getVideoType(detail.content_link);
  const isZoom = detail.content_type === 'zoom';
  
  // إذا كان فيديو (ليس Zoom)
  if (detail.content_link && videoType !== 'unknown' && !isZoom && videoType !== 'file') {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden mb-4 shadow-lg border border-gray-700">
        {videoType === 'youtube' ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${getYouTubeId(detail.content_link)}`}
            title={detail.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : videoType === 'vimeo' ? (
          <iframe
            className="w-full h-full"
            src={`https://player.vimeo.com/video/${getVimeoId(detail.content_link)}`}
            title={detail.title}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video 
            className="w-full h-full"
            controls
            controlsList="nodownload"
            preload="metadata"
          >
            <source src={detail.content_link} type="video/mp4" />
            <source src={detail.content_link} type="video/webm" />
            المتصفح لا يدعم تشغيل الفيديو
          </video>
        )}
      </div>
    );
  } 
  
  // عرض الملفات دائمًا إذا كان هناك ملف
  if (detail.file_path) {
    const fileUrl = detail.file_path;
    const fileName = getFileName(fileUrl);
    const fileExtension = getFileExtension(fileUrl);
    
    const getFileIcon = (ext: string) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const icons: any = {
        pdf: '📕',
        doc: '📘',
        docx: '📘',
        xls: '📗',
        xlsx: '📗',
        ppt: '📙',
        pptx: '📙',
        zip: '📦',
        rar: '📦',
        txt: '📄',
        default: '📎'
      };
      return icons[ext] || icons.default;
    };

    return (
      <div className="bg-gradient-to-r from-blue-700/30 to-blue-800/30 rounded-xl p-4 mb-4 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FiFileText className="text-white text-xl" />
            </div>
            <div>
              <div className="text-white font-medium">{fileName}</div>
              <div className="text-blue-300 text-sm">{fileExtension.toUpperCase()} ملف</div>
            </div>
          </div>
          <a
            href={fileUrl}
            download
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
          >
            <FiDownload />
            تحميل
          </a>
        </div>
      </div>
    );
  }
  
  return null;
};

export default function CourseDetailsPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<CourseDetail>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string, detail: CourseDetail} | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  
  const [newDetail, setNewDetail] = useState({
    course_id: courseId || '',
    title: '',
    description: '',
    content_type: 'video',
    content_link: '',
    files: [] as FileWithPreview[],
    session_date: '',
    session_time: ''
  })
  const API_URL = '/api';

  const openVideoModal = (videoUrl: string, title: string, detail: CourseDetail) => {
    const videoType = getVideoType(videoUrl);
    
    if (videoUrl.includes('zoom.us') || videoType === 'file') {
      // افتح Zoom والملفات في تاب جديد
      handleZoomLink(videoUrl, title);
    } else {
      // افتح الفيديوهات في المودال
      setSelectedVideo({ url: videoUrl, title, detail });
      setIsVideoModalOpen(true);
    }
  };

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
        toast.success(`تم تحميل ${data.data?.length || 0} تفصيل بنجاح`, {
    icon: <span>📚</span>
        })
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
  }, [courseId])

  const handleEdit = (detail: CourseDetail) => {
    setEditingId(detail.id)
    setEditForm({ 
      ...detail,
      session_time: detail.session_time ? formatTimeForAPI(detail.session_time) : ''
    })
  }

  const handleSave = async (id: number) => {
    try {
      const payload = new FormData()
      payload.append('course_id', courseId)

      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // تحويل الوقت إلى الصيغة الصحيحة قبل الإرسال
          if (key === 'session_time') {
            payload.append(key, formatTimeForAPI(value as string));
          } else {
            payload.append(key, value as string);
          }
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
        setEditForm({})
        fetchCourseDetails()
      } else {
        // عرض أخطاء التحقق
        if (data.errors) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.values(data.errors).forEach((error: any) => {
            toast.error(error[0])
          })
        } else {
          toast.error(data.message || 'فشل في التحديث')
        }
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
      payload.append('course_id', newDetail.course_id)
      payload.append('title', newDetail.title)
      payload.append('description', newDetail.description)
      payload.append('content_type', newDetail.content_type)
      payload.append('content_link', newDetail.content_link)
      
      if (newDetail.content_type === 'zoom') {
        payload.append('session_date', newDetail.session_date)
        // تحويل الوقت إلى الصيغة الصحيحة قبل الإرسال
        payload.append('session_time', formatTimeForAPI(newDetail.session_time))
      }
      
      // إضافة الملفات
      newDetail.files.forEach(fileWithPreview => {
        payload.append('files', fileWithPreview.file)
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
          content_type: 'video',
          content_link: '',
          files: [],
          session_date: '',
          session_time: ''
        })
        fetchCourseDetails()
      } else {
        // عرض أخطاء التحقق
        if (data.errors) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.values(data.errors).forEach((error: any) => {
            toast.error(error[0])
          })
        } else {
          toast.error(data.message || 'فشل في الإضافة')
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))
      setNewDetail({
        ...newDetail,
        files: [...newDetail.files, ...newFiles]
      })
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = [...newDetail.files]
    URL.revokeObjectURL(updatedFiles[index].preview)
    updatedFiles.splice(index, 1)
    setNewDetail({
      ...newDetail,
      files: updatedFiles
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-white text-lg">جار التحميل...</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 min-h-screen">
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
        
        <div className="mb-6 flex justify-between items-center">
          <Link 
            href="/teacher/courses" 
            className="inline-flex items-center bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 transform hover:-translate-x-2 shadow-lg hover:shadow-xl border border-gray-600"
          >
            <FiArrowLeft className="ml-2" />
            العودة إلى الكورسات
          </Link>

          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold border border-blue-500"
          >
            <FiPlus className="ml-2" />
            إضافة تفصيل جديد
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-3xl p-6 shadow-2xl border border-gray-600 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">
              إدارة محتوى الكورس
            </h1>
            <div className="text-gray-300 bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600">
              {courseDetails.length} عنصر
            </div>
          </div>

          {courseDetails.length === 0 ? (
            <div className="text-center py-16 text-gray-300 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700">
              <div className="text-8xl mb-6 opacity-50">📚</div>
              <p className="text-2xl mb-4">لا توجد تفاصيل متاحة</p>
              <p className="text-lg text-gray-400">ابدأ بإضافة أول تفصيل للمحتوى</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseDetails.map((detail) => (
                <div 
                  key={detail.id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 hover:from-gray-700 hover:to-gray-800 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl hover:shadow-3xl border border-gray-700 group"
                >
                  {editingId === detail.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="العنوان"
                      />
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="الوصف"
                      />
                      <select
                        value={editForm.content_type || ''}
                        onChange={(e) => setEditForm({...editForm, content_type: e.target.value})}
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      >
                        <option value="video">فيديو</option>
                        <option value="zoom">Zoom</option>
                      </select>
                      <input
                        type="url"
                        value={editForm.content_link || ''}
                        onChange={(e) => setEditForm({...editForm, content_link: e.target.value})}
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="رابط المحتوى"
                      />
                      
                      {editForm.content_type === 'zoom' && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">تاريخ الجلسة</label>
                            <input
                              type="date"
                              value={editForm.session_date || ''}
                              onChange={(e) => setEditForm({...editForm, session_date: e.target.value})}
                              className="w-full bg-gray-600 border border-gray-500 rounded-xl p-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">وقت الجلسة</label>
                            <input
                              type="time"
                              value={editForm.session_time || ''}
                              onChange={(e) => setEditForm({...editForm, session_time: e.target.value})}
                              className="w-full bg-gray-600 border border-gray-500 rounded-xl p-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSave(detail.id)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-blue-500"
                        >
                          <FiSave className="ml-2" />
                          حفظ
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl transition-all duration-300 shadow-lg border border-gray-500"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                          {detail.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(detail)}
                            className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 transform hover:scale-110 bg-yellow-500/20 p-2 rounded-xl border border-yellow-500/30"
                            title="تعديل"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(detail.id)}
                            className="text-red-400 hover:text-red-300 transition-all duration-300 transform hover:scale-110 bg-red-500/20 p-2 rounded-xl border border-red-500/30"
                            title="حذف"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {detail.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className={`px-3 py-1.5 rounded-xl flex items-center ${
                          detail.content_type === 'video' 
                            ? 'bg-gradient-to-r from-blue-600/50 to-blue-700/50 border border-blue-500/50' 
                            : 'bg-gradient-to-r from-purple-600/50 to-purple-700/50 border border-purple-500/50'
                        } text-white font-medium`}>
                          {detail.content_type === 'video' ? (
                            <>
                              <FiVideo className="ml-1" />
                              فيديو
                            </>
                          ) : (
                            <>
                              <FiLink className="ml-1" />
                              Zoom
                            </>
                          )}
                        </span>
                        
                        {detail.content_type === 'zoom' && detail.session_date && (
                          <div className="flex items-center text-yellow-300 bg-yellow-500/20 px-3 py-1 rounded-xl border border-yellow-500/30">
                            <FiCalendar className="ml-1" />
                            <span className="mx-1">{detail.session_date}</span>
                            {detail.session_time && (
                              <>
                                <FiClock className="mx-1" />
                                <span>{formatTimeForAPI(detail.session_time)}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* عرض المحتوى */}
                      {renderContent(detail)}
                      
                      {/* زر التشغيل للفيديوهات */}
                      {detail.content_link && !detail.content_link.includes('zoom.us') && getVideoType(detail.content_link) !== 'file' && (
                        <button
                          onClick={() => openVideoModal(detail.content_link, detail.title, detail)}
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl mt-3 border border-red-500/50"
                        >
                          <FiPlay />
                          مشاهدة المحتوى
                        </button>
                      )}
                      
                      {/* زر فتح Zoom والملفات */}
                      {(detail.content_link.includes('zoom.us') || getVideoType(detail.content_link) === 'file') && (
                        <button
                          onClick={() => openVideoModal(detail.content_link, detail.title, detail)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl mt-3 border border-green-500/50"
                        >
                          <FiExternalLink />
                          فتح الرابط
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* نموذج الإضافة */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600 animate-scaleIn">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">إضافة تفصيل جديد</h2>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="text-gray-400 hover:text-white transition-all duration-300 transform hover:rotate-90 p-2 rounded-full hover:bg-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddDetail} className="space-y-6">
                {/* العنوان */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">العنوان</label>
                  <input
                    type="text"
                    value={newDetail.title}
                    onChange={(e) => setNewDetail({...newDetail, title: e.target.value})}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                    placeholder="عنوان التفصيل"
                  />
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">الوصف</label>
                  <textarea
                    value={newDetail.description}
                    onChange={(e) => setNewDetail({...newDetail, description: e.target.value})}
                    rows={3}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                    placeholder="وصف التفصيل"
                  />
                </div>

                {/* نوع المحتوى */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">نوع المحتوى</label>
                  <select
                    value={newDetail.content_type}
                    onChange={(e) => setNewDetail({...newDetail, content_type: e.target.value})}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                  >
                    <option value="video">فيديو</option>
                    <option value="zoom">Zoom</option>
                  </select>
                </div>

                {/* رابط المحتوى */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">رابط المحتوى</label>
                  <input
                    type="url"
                    value={newDetail.content_link}
                    onChange={(e) => setNewDetail({...newDetail, content_link: e.target.value})}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>

                {/* حقول التاريخ والوقت لـ Zoom */}
                {newDetail.content_type === 'zoom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-xl border-2 border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FiCalendar className="ml-1" />
                        تاريخ الجلسة
                      </label>
                      <input
                        type="date"
                        value={newDetail.session_date}
                        onChange={(e) => setNewDetail({...newDetail, session_date: e.target.value})}
                        className="w-full bg-gray-600 border border-gray-500 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FiClock className="ml-1" />
                        وقت الجلسة
                      </label>
                      <input
                        type="time"
                        value={newDetail.session_time}
                        onChange={(e) => setNewDetail({...newDetail, session_time: e.target.value})}
                        className="w-full bg-gray-600 border border-gray-500 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* رفع ملفات متعددة */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">رفع ملفات (اختياري)</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 transition-all hover:border-gray-500 bg-gray-700/30">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="w-full bg-gray-600 rounded-xl p-2 text-white"
                    />
                    
                    {/* عرض الملفات المختارة */}
                    {newDetail.files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-300">الملفات المختارة:</p>
                        {newDetail.files.map((fileWithPreview, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-600 p-3 rounded-lg border border-gray-500">
                            <span className="text-white text-sm truncate max-w-xs">{fileWithPreview.file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 transition-all duration-300 transform hover:scale-110"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex gap-4 pt-6 justify-end border-t border-gray-700">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold border border-blue-500"
                  >
                    <FiPlus className="ml-2" />
                    إضافة التفصيل
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg border border-gray-500"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Video Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={selectedVideo?.url || ''}
          title={selectedVideo?.title || ''}
          detail={selectedVideo?.detail || {} as CourseDetail}
        />
      </div>

      {/* إضافة أنيميشن CSS مخصصة */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
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
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Layout>
  )
}
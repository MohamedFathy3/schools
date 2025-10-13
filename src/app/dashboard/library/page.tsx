'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FiPlus, FiDownload, FiFile, FiImage, FiVideo, FiFileText, FiUsers, FiBook } from 'react-icons/fi'
import Layout from '@/components/Layout'

interface LibraryItem {
  id: number
  title: string
  description: string
  type: 'student' | 'teacher'
  file_path: string
  file_url: string
  thumbnail_path?: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

interface FormData {
  title: string
  description: string
  type: 'student' | 'teacher'
  file: File | null
}

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-all duration-300">
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const FileIcon = ({ fileType }: { fileType?: string }) => {
  if (!fileType) return <FiFile className="w-6 h-6 text-gray-400" />
  
  if (fileType.includes('image')) return <FiImage className="w-6 h-6 text-blue-500" />
  if (fileType.includes('video')) return <FiVideo className="w-6 h-6 text-purple-500" />
  if (fileType.includes('pdf')) return <FiFileText className="w-6 h-6 text-red-500" />
  
  return <FiFile className="w-6 h-6 text-gray-400" />
}

export default function LibraryManagementPage() {
  const [studentItems, setStudentItems] = useState<LibraryItem[]>([])
  const [teacherItems, setTeacherItems] = useState<LibraryItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'student',
    file: null
  })

  const API_URL = '/api'

  // Fetch student libraries
  const fetchStudentLibraries = async () => {
    try {
      const res = await fetch(`${API_URL}/student-libraries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {},
          orderBy: 'created_at',
          orderByDirection: 'desc',
          perPage: 100,
          paginate: true
        })
      })
      const data = await res.json()
      
      if (data.data && Array.isArray(data.data)) {
        setStudentItems(data.data)
      } else if (Array.isArray(data)) {
        setStudentItems(data)
      } else {
        console.log('Student libraries response:', data)
        setStudentItems([])
      }
    } catch (err) {
      console.error('Fetch student libraries error:', err)
      toast.error('Error loading student libraries')
    }
  }

  // Fetch teacher libraries
  const fetchTeacherLibraries = async () => {
    try {
      const res = await fetch(`${API_URL}/teacher-libraries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {},
          orderBy: 'created_at',
          orderByDirection: 'desc',
          perPage: 100,
          paginate: true
        })
      })
      const data = await res.json()
      
      if (data.data && Array.isArray(data.data)) {
        setTeacherItems(data.data)
      } else if (Array.isArray(data)) {
        setTeacherItems(data)
      } else {
        console.log('Teacher libraries response:', data)
        setTeacherItems([])
      }
    } catch (err) {
      console.error('Fetch teacher libraries error:', err)
      // لا تعرض رسالة خطأ إذا كانت البيانات فارغة (هذا طبيعي)
      setTeacherItems([]) // ببساطة ضع مصفوفة فارغة
    }
  }

  useEffect(() => {
    fetchStudentLibraries()
    fetchTeacherLibraries()
  }, [])

  // Create Library Item - استخدم ال endpoint الصحيح
  const createLibraryItem = async (payload: FormData): Promise<boolean> => {
    try {
      const formPayload = new FormData()
      formPayload.append('title', payload.title)
      formPayload.append('description', payload.description)
      formPayload.append('type', payload.type)
      if (payload.file) {
        formPayload.append('file', payload.file)
      }

      // استخدم /api/library وليس /api/libraries
      const res = await fetch(`${API_URL}/libraries`, {
        method: 'POST',
        body: formPayload
      })
      
      const data = await res.json()
      
      // تحقق من ال response بناءً على الهيكل الذي أرسلته
      if (res.status === 201 || data.message === 'File uploaded successfully') {
        return true
      } else {
        toast.error(data.message || 'Failed to add library item')
        return false
      }
    } catch (err) {
      console.error('Create library error:', err)
      toast.error('Error adding library item')
      return false
    }
  }

  // Modal Handlers
  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      type: 'student',
      file: null
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.file) {
      toast.error('Please select a file')
      setIsSubmitting(false)
      return
    }

    const success = await createLibraryItem(formData)

    setIsSubmitting(false)
    
    if (success) {
      toast.success('Library item added successfully!')
      // Refresh both libraries after adding
      await fetchStudentLibraries()
      await fetchTeacherLibraries()
      // إغلاق المودال بعد الإضافة الناجحة
      closeModal()
    }
  }

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get latest 3 items for preview
  const latestStudentItems = studentItems.slice(0, 3)
  const latestTeacherItems = teacherItems.slice(0, 3)

  const getFileType = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image'
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) return 'video'
    if (['pdf'].includes(extension || '')) return 'pdf'
    return 'file'
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="light"
        />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Management</h1>
              <p className="text-gray-600">
                Student Items: <span className="font-semibold text-green-600">{studentItems.length}</span>
                {' • '}
                Teacher Items: <span className="font-semibold text-blue-600">{teacherItems.length}</span>
              </p>
            </div>
            
            <button 
              onClick={openAddModal} 
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <FiPlus className="mr-2" /> Add New Item
            </button>
          </div>
        </div>

        {/* Latest Items Preview */}
        <div className="space-y-8">
          {/* Student Libraries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Student Libraries</h2>
                <p className="text-gray-600">Latest resources for students</p>
              </div>
            </div>

            {latestStudentItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiBook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No student library items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestStudentItems.map((item) => {
                  const fileType = getFileType(item.file_path)
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <FileIcon fileType={fileType} />
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Student
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => downloadFile(item.file_url, item.title)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <FiDownload size={14} />
                          Download
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Teacher Libraries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBook className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Teacher Libraries</h2>
                <p className="text-gray-600">Latest resources for teachers</p>
              </div>
            </div>

            {latestTeacherItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiBook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No teacher library items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestTeacherItems.map((item) => {
                  const fileType = getFileType(item.file_path)
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <FileIcon fileType={fileType} />
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          Teacher
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => downloadFile(item.file_url, item.title)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <FiDownload size={14} />
                          Download
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal - فقط للإضافة */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title="Add New Library Item"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter item title..."
                className="w-full border border-gray-300 text-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter item description..."
                rows={4}
                className="w-full border border-gray-300 text-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                required
              />
            </div>

            {/* Type - اختيار النوع */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Select Audience *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
              >
                <option value="student">For Students (student-libraries)</option>
                <option value="teacher">For Teachers (teacher-libraries)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {formData.type === 'student' 
                  ? 'This item will be shown in student-libraries section' 
                  : 'This item will be shown in teacher-libraries section'
                }
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-300 hover:border-blue-400">
                <FiFile className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Choose a file to upload</p>
                <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                  <FiPlus />
                  <span>Choose File</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
                <p className="text-gray-500 text-sm mt-3">Supports: Images, Videos, PDF, Documents</p>
              </div>
              
              {/* Show selected file name */}
              {formData.file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileIcon fileType={formData.file.type} />
                    <span className="text-sm text-gray-700">{formData.file.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Item'
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
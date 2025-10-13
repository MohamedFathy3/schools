'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FiDownload, FiFile, FiImage, FiVideo, FiFileText, FiSearch, FiGrid, FiList, FiBook } from 'react-icons/fi'
import Layout from '@/components/Layoutteacher'

interface LibraryItem {
  id: number
  title: string
  description: string
  type: 'student' | 'teacher'
  file_path: string
  file_url: string
  thumbnail_path: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export default function TeacherLibrariesPage() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'pdf' | 'file'>('all')

  const API_URL = '/api'

  // Fetch teacher libraries
  const fetchTeacherLibraries = async () => {
    try {
      setLoading(true)
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
        setLibraryItems(data.data)
      } else {
        console.log('Teacher libraries response:', data)
        setLibraryItems([])
      }
    } catch (err) {
      console.error('Fetch teacher libraries error:', err)
      toast.error('Error loading teacher libraries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeacherLibraries()
  }, [])

  // Filter items based on search and type
  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || getFileType(item.file_path) === filterType
    
    return matchesSearch && matchesType
  })

  const getFileType = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image'
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(extension || '')) return 'video'
    if (['pdf'].includes(extension || '')) return 'pdf'
    return 'file'
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <FiImage className="w-5 h-5 text-blue-500" />
      case 'video': return <FiVideo className="w-5 h-5 text-purple-500" />
      case 'pdf': return <FiFileText className="w-5 h-5 text-red-500" />
      default: return <FiFile className="w-5 h-5 text-gray-500" />
    }
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'pdf': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileTypeText = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'صورة'
      case 'video': return 'فيديو'
      case 'pdf': return 'PDF'
      default: return 'ملف'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">مكتبة المعلمين</h1>
              <p className="text-gray-600">
                إجمالي الملفات: <span className="font-semibold text-blue-600">{libraryItems.length}</span>
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث في الملفات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-3 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filter by Type */}
              <div className="flex gap-2">
                <select
                  value={filterType}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">كل الملفات</option>
                  <option value="image">الصور</option>
                  <option value="video">الفيديوهات</option>
                  <option value="pdf">PDF</option>
                  <option value="file">ملفات أخرى</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الملفات...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد ملفات</h3>
            <p className="text-gray-400">
              {searchTerm || filterType !== 'all' 
                ? 'لم يتم العثور على ملفات تطابق معايير البحث' 
                : 'لا توجد ملفات في المكتبة حتى الآن'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const fileType = getFileType(item.file_path)
              
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  {/* File Preview */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {fileType === 'image' ? (
                      <img
                        src={item.file_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : fileType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                        <FiVideo className="w-12 h-12 text-purple-500" />
                      </div>
                    ) : fileType === 'pdf' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                        <FiFileText className="w-12 h-12 text-red-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <FiFile className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    
                    {/* File Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(fileType)}`}>
                        {getFileTypeText(fileType)}
                      </span>
                    </div>
                    
                    {/* Download Button */}
                    <button
                      onClick={() => downloadFile(item.file_url, item.title)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      {getFileIcon(fileType)}
                      <span className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-relaxed">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <button
                      onClick={() => downloadFile(item.file_url, item.title)}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      تحميل الملف
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الملف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوصف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const fileType = getFileType(item.file_path)
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(fileType)}
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {item.title}
                              </h3>
                              <p className="text-gray-500 text-xs">
                                {fileType === 'image' ? 'صورة' : 
                                 fileType === 'video' ? 'فيديو' : 
                                 fileType === 'pdf' ? 'ملف PDF' : 'ملف'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFileTypeColor(fileType)}`}>
                            {getFileTypeText(fileType)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm line-clamp-2 max-w-xs">
                            {item.description}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-sm">
                            {formatDate(item.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => downloadFile(item.file_url, item.title)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            <FiDownload className="w-4 h-4" />
                            تحميل
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
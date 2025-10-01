'use client'
import React, { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FiPlus, FiEdit, FiTrash2, FiX, FiChevronUp, FiChevronDown, FiSearch, FiImage, FiFilter, FiRefreshCw } from 'react-icons/fi'
import Layout from '@/components/Layout'

type Subject = {
  id: number
  name: string
  stage_id: number
  stage: {id:number, name: string, postion: number}
  stage_name?: string
  position?: number
  active: boolean
  image?: string
}

type Stage = { id: number, name: string }

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-gray-900 z-10 p-6 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110 hover:rotate-90 duration-300"
          >
            <FiX size={28} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Toggle Switch Component
const ToggleSwitch = ({ 
  active, 
  onToggle, 
  subjectId 
}: { 
  active: boolean
  onToggle: (subjectId: number, newStatus: boolean) => Promise<void>
  subjectId: number
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(subjectId, !active)
    } catch (error) {
      // Error is handled in the parent function
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-500 ${
        active 
          ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30' 
          : 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-inner'
      } transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-lg transition-all duration-500 ${
          active ? 'translate-x-8' : 'translate-x-1'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </button>
  )
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Subject>('name')
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject|null>(null)
  const [formData, setFormData] = useState({
    name: '',
    stage_id: '',
    position: '1',
    active: '1',
    image: null as File|null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState('')

  const API_URL = '/api'

  const fetchStages = async () => {
    try {
      const res = await fetch(`${API_URL}/stage/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {},
          orderBy: "id",
          orderByDirection: "asc",
          perPage: 300,
          paginate: true,
          delete: false
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setStages(data.data || [])
      } else {
        toast.error('Failed to load stages')
      }
    } catch (err) {
      console.error('Fetch stages error:', err)
      toast.error('Error loading stages')
    }
  }

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/subject/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {},
          orderBy: "id",
          orderByDirection: "asc",
          perPage: 300,
          paginate: true,
          delete: false
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setSubjects(data.data || [])
      } else {
        toast.error('Failed to load subjects')
      }
    } catch (err) {
      console.error('Fetch subjects error:', err)
      toast.error('Error loading subjects')
    }
  }

  useEffect(() => {
    fetchStages()
    fetchSubjects()
  }, [])

  // CRUD Operations
  const createSubject = async (payload: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/subject`, { 
        method: 'POST', 
        body: payload 
      })
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        return true
      } else {
        toast.error(data.message || 'Failed to add subject')
        return false
      }
    } catch (err) {
      console.error('Create subject error:', err)
      toast.error('Error adding subject')
      return false
    }
  }

  const updateSubject = async (id: number, payload: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/subject/update/${id}`, { 
        method: 'POST', 
        body: payload 
      })
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        return true
      } else {
        if (data.errors) {
          Object.values(data.errors).forEach((arr: any) => 
            arr.forEach((e: string) => toast.error(e))
          )
        } else {
          toast.error(data.message || 'Failed to update subject')
        }
        return false
      }
    } catch (err) {
      console.error('Update subject error:', err)
      toast.error('Error updating subject')
      return false
    }
  }

const toggleSubjectActive = async (id: number, newStatus: boolean): Promise<void> => {
  const originalSubjects = [...subjects]
  
  // Immediate UI update
  setSubjects(prevSubjects =>
    prevSubjects.map(subject =>
      subject.id === id ? { ...subject, active: newStatus } : subject
    )
  )
  
  try {
    // جرب كل الصيغ الممكنة
    const payloads = [
      { active: newStatus ? 1 : 0 },
      { active: newStatus },
      { status: newStatus ? 1 : 0 },
      { status: newStatus },
      { is_active: newStatus ? 1 : 0 },
      { is_active: newStatus }
    ]

    let success = false
    let lastError = ''

    for (const payload of payloads) {
      try {
        console.log('🔐 Trying payload:', payload)
        
        const res = await fetch(`${API_URL}/subject/${id}/active`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        const data = await res.json()
        console.log('📡 Response:', data)

        if (data.status === 200 || data.success || data.message?.includes('success')) {
          success = true
          toast.success(`Subject ${newStatus ? 'activated' : 'deactivated'} successfully! 🎉`)
          break
        } else {
          lastError = data.message || 'Unknown error'
        }
      } catch (err) {
        console.error('Attempt failed:', err)
        lastError = 'Request failed'
      }
    }

    if (!success) {
      throw new Error(lastError || 'All attempts failed')
    }

  } catch (err) {
    // Revert to original state if request fails
    setSubjects(originalSubjects)
    toast.error('Failed to update subject status')
    console.error('Toggle active error:', err)
  }
}

  const deleteSubject = async (id: number): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this subject?')) return false
    
    try {
      const res = await fetch(`${API_URL}/subject/delete`, { 
         method:'DELETE', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ items:[id] }) 
      })
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        toast.success('Subject deleted successfully! 🗑️')
        await fetchSubjects()
        return true
      } else {
        toast.error(data.message || 'Failed to delete subject')
        return false
      }
    } catch (err) {
      console.error('Delete subject error:', err)
      toast.error('Error deleting subject')
      return false
    }
  }

  // Modal Handlers
  const openAddModal = () => {
    setEditingSubject(null)
    setFormData({ 
      name: '', 
      stage_id: '', 
      position: '1', 
      active: '1', 
      image: null 
    })
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name || '',
      stage_id: subject.stage.id.toString(),
      position: subject.position?.toString() || subject.stage?.postion?.toString() || '1',
      active: subject.active ? '1' : '0',
      image: null
    })
    setImagePreview(subject.image ? 
      (subject.image.startsWith('http') ? subject.image : `${API_URL}/${subject.image}`) 
      : null
    )
    setIsModalOpen(true)
  }

  const closeModal = () => { 
    setIsModalOpen(false)
    setImagePreview(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, image: file }))
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validation
    if (!formData.name.trim()) { 
      toast.error('Name is required')
      setIsSubmitting(false)
      return 
    }
    if (!formData.stage_id) { 
      toast.error('Please select a stage')
      setIsSubmitting(false)
      return 
    }

    const payload = new FormData()
    payload.append('name', formData.name)
    payload.append('stage_id', formData.stage_id)
    payload.append('position', formData.position)
    payload.append('active', formData.active)
    if (formData.image) payload.append('image', formData.image)

    let success = false
    
    if (editingSubject) {
      success = await updateSubject(editingSubject.id, payload)
    } else {
      success = await createSubject(payload)
    }

    setIsSubmitting(false)
    
    if (success) {
      toast.success(
        editingSubject ? 'Subject updated successfully! ✨' : 'Subject added successfully! 🎉',
        {
          className: '!bg-green-600 !text-white'
        }
      )
      await fetchSubjects()
      closeModal()
    }
  }

  // Filtering and Sorting
  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.stage?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  )
  
  const nameFilteredSubjects = nameFilter 
    ? filteredSubjects.filter(s => 
        nameFilter === 'A-Z' 
          ? s.name.match(/^[ا-ي]/)
          : s.name.match(/^[a-zA-Z]/)
      )
    : filteredSubjects
  
  const sortedSubjects = [...nameFilteredSubjects].sort((a,b)=>{
    const aVal = (a[sortField] as any) ?? ''
    const bVal = (b[sortField] as any) ?? ''
    const aStr = typeof aVal==='string'?aVal.toLowerCase():aVal
    const bStr = typeof bVal==='string'?bVal.toLowerCase():bVal
    if(aStr<bStr) return sortDirection==='asc'? -1:1
    if(aStr>bStr) return sortDirection==='asc'? 1:-1
    return 0
  })
  
  const handleSort = (field: keyof Subject) => {
    if(sortField===field) {
      setSortDirection(prev=>prev==='asc'?'desc':'asc')
    } else { 
      setSortField(field)
      setSortDirection('asc') 
    }
  }
  
  const renderSortIcon=(field: keyof Subject)=>sortField!==field?null:(
    sortDirection==='asc'?<FiChevronUp size={16} className="text-blue-400"/>:<FiChevronDown size={16} className="text-blue-400"/>
  )

  const applyNameFilter = (filterType: string) => {
    setNameFilter(filterType)
    setIsFilterOpen(false)
  }

  const resetFilter = () => {
    setNameFilter('')
    setSearchTerm('')
    setSortField('name')
    setSortDirection('asc')
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen text-gray-100">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={true} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="dark"
        />
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Subjects Management
            </h1>
            <p className="text-gray-400">
              Total Subjects: {sortedSubjects.length}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by subject or stage..." 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                className="bg-gray-700 border-2 border-gray-600 text-white p-4 rounded-2xl pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 w-80 focus:shadow-lg focus:shadow-blue-500/20"
              />
            </div>
            
            {/* Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  nameFilter 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600'
                }`}
              >
                <FiFilter className="ml-2" /> 
                Filter
                {nameFilter && (
                  <span className="bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 font-bold">
                    {nameFilter === 'A-Z' ? 'AR' : 'EN'}
                  </span>
                )}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 bg-gray-800 border-2 border-gray-700 rounded-2xl shadow-2xl z-10 w-48 animate-scaleIn">
                  <div className="p-2">
                    <button 
                      onClick={() => applyNameFilter('A-Z')}
                      className={`block w-full text-right px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                        nameFilter === 'A-Z' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                          : 'text-gray-200 hover:bg-gray-700 hover:transform hover:scale-105'
                      }`}
                    >
                      Arabic (A-Z)
                    </button>
                    <button 
                      onClick={() => applyNameFilter('a-z')}
                      className={`block w-full text-right px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                        nameFilter === 'a-z' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                          : 'text-gray-200 hover:bg-gray-700 hover:transform hover:scale-105'
                      }`}
                    >
                      English (a-z)
                    </button>
                    <hr className="my-2 border-gray-700" />
                    <button 
                      onClick={resetFilter}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:transform hover:scale-105"
                    >
                      <FiRefreshCw className="ml-1" /> Reset All
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add Button */}
            <button 
              onClick={openAddModal} 
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/30"
            >
              <FiPlus className="ml-2" /> Add Subject
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-gray-700 rounded-3xl shadow-2xl border-2 border-gray-600 animate-slideUp">
          <table className="w-full table-auto text-sm text-gray-300">
            <thead className="bg-gradient-to-r from-gray-600 to-gray-700">
              <tr>
                <th 
                  onClick={() => handleSort('name')} 
                  className="cursor-pointer px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/4 group transition-all duration-300 hover:bg-gray-550"
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Subject Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stage_name')} 
                  className="cursor-pointer px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/4 group transition-all duration-300 hover:bg-gray-550"
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Stage</span>
                    {renderSortIcon('stage_name')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('position')} 
                  className="cursor-pointer px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/6 group transition-all duration-300 hover:bg-gray-550"
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Position</span>
                    {renderSortIcon('position')}
                  </div>
                </th>
                <th className="px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/6">Status</th>
                <th className="px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {sortedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 animate-fadeIn">
                      <FiSearch size={64} className="mb-4 opacity-30" />
                      <p className="text-2xl mb-2 font-light">No subjects found</p>
                      <p className="text-gray-500 text-lg">No subjects match your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSubjects.map((subject, index) => (
                  <tr 
                    key={subject.id} 
                    className="transition-all duration-500 hover:bg-gray-600 group animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors duration-300">
                        {subject.name}
                      </div>
                      {subject.position && (
                        <div className="text-xs text-gray-400 mt-1">Position: {subject.position}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="bg-gray-600 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium group-hover:bg-gray-500 transition-all duration-300">
                        {subject.stage?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                        {subject.position || subject.stage?.postion || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-center">
                        <ToggleSwitch 
                          active={!!subject.active} 
                          onToggle={toggleSubjectActive}
                          subjectId={subject.id}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(subject)}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-yellow-500/30 active:scale-95"
                          title="Edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-red-500/30 active:scale-95"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Name */}
            <div className="bg-gray-750 p-5 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300">
              <label className="block text-gray-200 mb-3 text-sm font-bold">Subject Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter subject name..."
                className="bg-gray-800 border-2 border-gray-700 text-white p-4 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 placeholder-gray-500 shadow-inner hover:border-gray-600"
                required
              />
            </div>

            {/* Stage */}
            <div className="bg-gray-750 p-5 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300">
              <label className="block text-gray-200 mb-3 text-sm font-bold">Stage *</label>
              <div className="relative">
                <select
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={handleSelectChange}
                  className="bg-gray-800 border-2 border-gray-700 text-white p-4 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 appearance-none cursor-pointer shadow-inner pr-12 hover:border-gray-600"
                  required
                >
                  <option value="" className="text-gray-500 bg-gray-800">Select stage...</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id} className="bg-gray-800 text-white">
                      {stage.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="bg-gray-750 p-5 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300">
              <label className="block text-gray-200 mb-3 text-sm font-bold">Position</label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Enter position..."
                className="bg-gray-800 border-2 border-gray-700 text-white p-4 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 shadow-inner hover:border-gray-600"
                min="1"
              />
            </div>

            {/* Status */}
            <div className="bg-gray-750 p-5 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-gray-200 font-bold">Subject Status</span>
                  <p className="text-gray-400 text-sm mt-1">Activate or deactivate subject</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.active === '1'}
                    onChange={(checked) => setFormData(prev => ({ ...prev, active: checked ? '1' : '0' }))}
                    className={`${formData.active === '1' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'} relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg transform hover:scale-105`}
                  >
                    <span className={`${formData.active === '1' ? 'translate-x-7' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg`} />
                  </Switch>
                  <span className={`font-bold ${formData.active === '1' ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.active === '1' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Image */}
            <div className="bg-gray-750 p-5 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300">
              <label className="block text-gray-200 mb-3 text-sm font-bold">Subject Image</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 bg-gray-800 hover:bg-gray-750">
                <div className="text-center mb-4">
                  <FiImage className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-2">Drag & drop image here or</p>
                </div>
                <label className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 font-bold shadow-lg">
                  <span>Choose Image</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                <p className="text-gray-500 text-xs mt-4">PNG, JPG, GIF - Max 10MB</p>
              </div>
              
              {imagePreview && (
                <div className="mt-6 p-5 bg-gray-800 rounded-xl border-2 border-gray-700 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-200 text-sm font-bold">Image Preview:</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }))
                        setImagePreview(null)
                      }}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors duration-300 flex items-center gap-1 hover:transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Image
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={imagePreview} 
                      alt="Image preview" 
                      className="w-24 h-24 object-cover rounded-xl border-2 border-gray-600 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-500 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <FiX className="w-5 h-5" />
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 font-bold flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    {editingSubject ? (
                      <>
                        <FiEdit className="w-5 h-5" />
                        Update Subject
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-5 h-5" />
                        Add Subject
                      </>
                    )}
                  </span>
                )}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </form>
        </Modal>

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
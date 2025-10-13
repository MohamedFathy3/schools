'use client'
import React, { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify'
import { FiPlus, FiEdit, FiTrash2, FiX, FiChevronUp, FiChevronDown, FiSearch, FiImage, FiFilter, FiRefreshCw, FiEye } from 'react-icons/fi'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:scale-110"
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
      className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all duration-300 ${
        active 
          ? 'bg-blue-600 shadow-lg shadow-blue-500/30' 
          : 'bg-gray-300 shadow-inner'
      } transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-lg transition-all duration-300 ${
          active ? 'translate-x-6' : 'translate-x-1'
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          const res = await fetch(`${API_URL}/subject/${id}/active`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          
          const data = await res.json()

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
        editingSubject ? 'Subject updated successfully! ✨' : 'Subject added successfully! 🎉'
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aVal = (a[sortField] as any) ?? ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    sortDirection==='asc'?<FiChevronUp size={16} className="text-blue-600"/>:<FiChevronDown size={16} className="text-blue-600"/>
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
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="light"
          toastClassName="!bg-white !border !border-gray-200 !text-gray-800 !rounded-xl !shadow-lg"
        />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Subjects Management
            </h1>
            <p className="text-gray-600 text-lg">
              Total Subjects: <span className="font-bold text-blue-600">{sortedSubjects.length}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search subjects or stages..." 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                className="w-full bg-white border-2 border-gray-300 text-gray-800 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>
            
            {/* Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-6 py-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  nameFilter 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-md'
                }`}
              >
                <FiFilter className="mr-2" /> 
                Filter
                {nameFilter && (
                  <span className="ml-2 bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {nameFilter === 'A-Z' ? 'AR' : 'EN'}
                  </span>
                )}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-10 w-56 overflow-hidden">
                  <div className="p-3">
                    <button 
                      onClick={() => applyNameFilter('A-Z')}
                      className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 mb-2 ${
                        nameFilter === 'A-Z' 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-blue-50 hover:transform hover:scale-105'
                      }`}
                    >
                      Arabic Subjects (A-Z)
                    </button>
                    <button 
                      onClick={() => applyNameFilter('a-z')}
                      className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                        nameFilter === 'a-z' 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-blue-50 hover:transform hover:scale-105'
                      }`}
                    >
                      English Subjects (a-z)
                    </button>
                    <hr className="my-3 border-gray-200" />
                    <button 
                      onClick={resetFilter}
                      className="flex items-center justify-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:transform hover:scale-105"
                    >
                      <FiRefreshCw className="mr-2" /> Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add Button */}
            <button 
              onClick={openAddModal} 
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <FiPlus className="mr-2" /> Add New Subject
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Subjects List</h2>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="text-sm">Sorted by: {sortField}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  nameFilter ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                }`}>
                  {nameFilter || 'All Subjects'}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    onClick={() => handleSort('name')} 
                    className="cursor-pointer px-8 py-6 text-left font-bold text-gray-700 uppercase tracking-wider group transition-all duration-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-2">
                      <span>Subject Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('stage_name')} 
                    className="cursor-pointer px-8 py-6 text-left font-bold text-gray-700 uppercase tracking-wider group transition-all duration-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-2">
                      <span>Stage</span>
                      {renderSortIcon('stage_name')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('position')} 
                    className="cursor-pointer px-8 py-6 text-left font-bold text-gray-700 uppercase tracking-wider group transition-all duration-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-2">
                      <span>Position</span>
                      {renderSortIcon('position')}
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-left font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FiSearch size={64} className="mb-4 text-gray-300" />
                        <p className="text-2xl mb-2 font-light text-gray-400">No subjects found</p>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedSubjects.map((subject, index) => (
                    <tr 
                      key={subject.id} 
                      className="transition-all duration-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                        
                          <div>
                            <div className="font-semibold text-gray-800 text-lg group-hover:text-blue-600 transition-colors duration-300">
                              {subject.name}
                            </div>
                            {subject.position && (
                              <div className="text-sm text-gray-500 mt-1">Position: {subject.position}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {subject.stage?.name || '-'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
                          {subject.position || subject.stage?.postion || '0'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            subject.active 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {subject.active ? 'Active' : 'Inactive'}
                          </span>
                          <ToggleSwitch 
                            active={!!subject.active} 
                            onToggle={toggleSubjectActive}
                            subjectId={subject.id}
                          />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(subject)}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            title="Edit Subject"
                          >
                            <FiEdit size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                            title="Delete Subject"
                          >
                            <FiTrash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Name */}
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-200">
              <label className="block text-gray-800 mb-3 text-lg font-semibold">Subject Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter subject name..."
                className="bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 placeholder-gray-500 shadow-sm hover:border-blue-400"
                required
              />
            </div>

            {/* Stage */}
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-200">
              <label className="block text-gray-800 mb-3 text-lg font-semibold">Stage *</label>
              <div className="relative">
                <select
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={handleSelectChange}
                  className="bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 appearance-none cursor-pointer shadow-sm pr-12 hover:border-blue-400"
                  required
                >
                  <option value="" className="text-gray-500">Select stage...</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-200">
              <label className="block text-gray-800 mb-3 text-lg font-semibold">Position</label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Enter position..."
                className="bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 shadow-sm hover:border-blue-400"
                min="1"
              />
            </div>

            {/* Status */}
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-gray-800 font-semibold text-lg">Subject Status</span>
                  <p className="text-gray-600 text-sm mt-1">Activate or deactivate this subject</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.active === '1'}
                    onChange={(checked) => setFormData(prev => ({ ...prev, active: checked ? '1' : '0' }))}
                    className={`${formData.active === '1' ? 'bg-blue-600' : 'bg-gray-300'} relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transform hover:scale-105`}
                  >
                    <span className={`${formData.active === '1' ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-md`} />
                  </Switch>
                  <span className={`font-semibold ${formData.active === '1' ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.active === '1' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Image */}
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-200">
              <label className="block text-gray-800 mb-3 text-lg font-semibold">Subject Image</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-2xl p-8 transition-all duration-300 hover:border-blue-400 bg-white hover:bg-blue-25">
                <div className="text-center mb-4">
                  <FiImage className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">Drag & drop your image here</p>
                  <p className="text-gray-500 text-sm">or click to browse files</p>
                </div>
                <label className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                <p className="text-gray-500 text-sm mt-4">PNG, JPG, GIF - Maximum 10MB</p>
              </div>
              
              {imagePreview && (
                <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-800 text-lg font-semibold">Image Preview:</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }))
                        setImagePreview(null)
                      }}
                      className="text-red-500 hover:text-red-600 text-sm transition-colors duration-300 flex items-center gap-2 hover:transform hover:scale-105"
                    >
                      <FiTrash2 size={16} />
                      Remove Image
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-200 shadow-md"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <FiX size={20} />
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    {editingSubject ? (
                      <>
                        <FiEdit size={20} />
                        Update Subject
                      </>
                    ) : (
                      <>
                        <FiPlus size={20} />
                        Add Subject
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
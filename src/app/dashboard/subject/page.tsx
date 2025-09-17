// eslint-disable-next-line @typescript-eslint/no-explicit-any

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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 z-10 p-6 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110"
          >
            <FiX size={28} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
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
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  const fetchStages = async () => {
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
      if (data.status === 200) setStages(data.data || [])
      else toast.error('فشل في تحميل المراحل')
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ في تحميل المراحل')
    }
  }

  const fetchSubjects = async () => {
    setIsLoading(false)
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
      if (data.status === 200) setSubjects(data.data || [])
      else toast.error('فشل في تحميل المواد الدراسية')
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ في تحميل المواد الدراسية')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStages()
    fetchSubjects()
  }, [])

  // CRUD
  const createSubject = async (payload: FormData) => {
    try {
      const res = await fetch(`${API_URL}/subject`, { method: 'POST', body: payload })
      const data = await res.json()
      if (data.success) return true
      else {
        toast.error(data.message || 'فشل في إضافة المادة')
        return false
      }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء الإضافة')
      return false
    }
  }

  const updateSubject = async (id: number, payload: FormData) => {
    try {
      const res = await fetch(`${API_URL}/subject/update/${id}`, { method: 'POST', body: payload })
      const data = await res.json()
      if (data.success) return true
      else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (data.errors) Object.values(data.errors).forEach((arr: any) => arr.forEach((e: string) => toast.error(e)))
        else toast.error(data.message || 'فشل في التحديث')
        return false
      }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء التحديث')
      return false
    }
  }

  const toggleSubjectActive = async (id: number, newStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/subject/${id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active: newStatus ? 1 : 0 }),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()

      if (data.success) {
        // ✅ تحديث مباشر للـ UI
        setSubjects(prevSubjects =>
          prevSubjects.map(subject =>
            subject.id === id ? { ...subject, active: newStatus } : subject
          )
        )

        // ✅ إشعار نجاح
        toast.success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} المادة بنجاح`)
      } else {
        toast.error(data.message || 'فشل في تحديث الحالة')
      }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء تحديث الحالة')
    }
  }

  const deleteSubject = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return false
    try {
      const res = await fetch(`${API_URL}/subject/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) return true
      else { toast.error(data.message || 'فشل في الحذف'); return false }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء الحذف')
      return false
    }
  }

  // مودال
  const openAddModal = () => {
    setEditingSubject(null)
    setFormData({ name: '', stage_id: '', position: '1', active: '1', image: null })
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
    setImagePreview(subject.image ? (subject.image.startsWith('http') ? subject.image : `${API_URL}/${subject.image}`) : null)
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setImagePreview(null) }

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
    if (!formData.name.trim()) { toast.error('الاسم مطلوب'); setIsSubmitting(false); return }
    if (!formData.stage_id) { toast.error('اختر المرحلة'); setIsSubmitting(false); return }

    const payload = new FormData()
    payload.append('name', formData.name)
    payload.append('stage_id', formData.stage_id)
    payload.append('position', formData.position)
    payload.append('active', formData.active)
    if (formData.image) payload.append('image', formData.image)

    let ok = false
    if (editingSubject) ok = await updateSubject(editingSubject.id, payload)
    else ok = await createSubject(payload)

    setIsSubmitting(false)
    if (ok) {
      toast.success(editingSubject ? 'تم تحديث المادة بنجاح' : 'تم إضافة المادة بنجاح', {
        className: 'bg-green-800 text-white border-0'
      })
      await fetchSubjects() // تحديث البيانات فقط
      closeModal()          // إغلاق المودال بدون إعادة تحميل الصفحة
    }
  }

  const handleDelete = async (id: number) => {
    const ok = await deleteSubject(id)
    if (ok) {
      toast.success('تم حذف المادة بنجاح', {
        className: 'bg-green-800 text-white border-0'
      })
      await fetchSubjects()
    }
  }

  // فلترة وترتيب
  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.stage?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  )
  
  // تطبيق فلترة الاسم إذا كانت محددة
  const nameFilteredSubjects = nameFilter 
    ? filteredSubjects.filter(s => 
        nameFilter === 'A-Z' 
          ? s.name.match(/^[ا-ي]/) // تبدأ بحرف عربي
          : s.name.match(/^[a-zA-Z]/) // تبدأ بحرف إنجليزي
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
    if(sortField===field) setSortDirection(prev=>prev==='asc'?'desc':'asc')
    else { setSortField(field); setSortDirection('asc') }
  }
  
  const renderSortIcon=(field: keyof Subject)=>sortField!==field?null:(sortDirection==='asc'?<FiChevronUp size={16}/>:<FiChevronDown size={16}/>)

  // تطبيق الفلتر حسب الحروف
  const applyNameFilter = (filterType: string) => {
    setNameFilter(filterType)
    setIsFilterOpen(false)
  }

  // استعادة الفلتر
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
          toastClassName={() => "bg-gray-800 border border-gray-700 text-white rounded-xl p-4 mb-3"}
          progressClassName="bg-gradient-to-r from-blue-500 to-purple-500"
        />
        <h1 className="text-3xl font-bold mb-6 text-white">إدارة المواد الدراسية</h1>
        
        {/* شريط البحث والفلترة */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="relative flex-grow max-w-md">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="ابحث باسم المادة أو المرحلة..." 
              value={searchTerm} 
              onChange={e=>setSearchTerm(e.target.value)} 
              className="bg-gray-700 border border-gray-600 text-white p-3 rounded-xl w-full pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* زر الفلترة */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-4 py-3 rounded-xl shadow-lg transition-all duration-200 ${nameFilter ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                <FiFilter className="ml-2" /> 
                فلترة
                {nameFilter && <span className="bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2">{nameFilter === 'A-Z' ? 'ع' : 'EN'}</span>}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10 w-48">
                  <div className="p-2">
                    <button 
                      onClick={() => applyNameFilter('A-Z')}
                      className={`block w-full text-right px-4 py-2 text-sm rounded-lg transition-colors ${nameFilter === 'A-Z' ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                    >
                      من أ إلى ي (A-Z)
                    </button>
                    <button 
                      onClick={() => applyNameFilter('a-z')}
                      className={`block w-full text-right px-4 py-2 text-sm rounded-lg transition-colors ${nameFilter === 'a-z' ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                    >
                      من a إلى z (إنجليزي)
                    </button>
                    <hr className="my-2 border-gray-700" />
                    <button 
                      onClick={resetFilter}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FiRefreshCw className="ml-1" /> استعادة الكل
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={openAddModal} className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
              <FiPlus className="ml-2" /> إضافة مادة
            </button>
          </div>
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
          <table className="w-full table-auto text-sm text-gray-300">
            <thead className="bg-blue-600 ">
              <tr>
                <th onClick={() => handleSort('name')} className="cursor-pointer px-6 py-4 text-right font-semibold uppercase tracking-wider w-1/4">
                  <div className="flex items-center justify-end gap-2">
                    <span>اسم المادة</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th onClick={() => handleSort('stage_name')} className="cursor-pointer px-6 py-4 text-right font-semibold uppercase tracking-wider w-1/4">
                  <div className="flex items-center justify-end gap-2">
                    <span>المرحلة</span>
                    {renderSortIcon('stage_name')}
                  </div>
                </th>
                <th onClick={() => handleSort('position')} className="cursor-pointer px-6 py-4 text-right font-semibold uppercase tracking-wider w-1/6">
                  <div className="flex items-center justify-end gap-2">
                    <span>الترتيب</span>
                    {renderSortIcon('position')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider w-1/6">الحالة</th>
                <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider w-1/6">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-lg">جاري تحميل البيانات...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FiSearch size={48} className="mb-4 opacity-50" />
                      <p className="text-xl mb-2">لا توجد مواد لعرضها</p>
                      <p className="text-gray-500">لم يتم العثور على أي مواد تطابق معايير البحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSubjects.map(subject => (
                  <tr key={subject.id} className="transition-all duration-200 hover:bg-gray-750 bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-white font-medium">{subject.name}</div>
                      {subject.position && (
                        <div className="text-xs text-gray-400 mt-1">الترتيب: {subject.position}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="bg-gray-700 inline-flex items-center px-3 py-1 rounded-full text-sm">
                        {subject.stage?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                        {subject.position || subject.stage?.postion || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Switch
                        checked={!!subject.active}
                        onChange={() => toggleSubjectActive(subject.id, !subject.active)}
                        className={`${subject.active ? 'bg-green-600' : 'bg-red-600'}
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                      >
                        <span className="sr-only">تغيير الحالة</span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${subject.active ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </Switch>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-2.5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-110"
                        title="تعديل"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-110"
                        title="حذف"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title={editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم المادة */}
            <div className="bg-gray-750 p-5 rounded-2xl border border-gray-600">
              <label className="block text-gray-200 mb-3 text-sm font-semibold">اسم المادة *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المادة هنا..."
                className="bg-gray-800 border-2 border-gray-700 text-white p-4 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 placeholder-gray-500 shadow-inner"
                required
              />
            </div>


            {/* المرحلة */}
            <div className="bg-gray-750 p-5 rounded-2xl border border-gray-600">
              <label className="block text-gray-200 mb-3 text-sm font-semibold">المرحلة *</label>
              <div className="relative">
                <select
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={handleSelectChange}
                  className="bg-gray-800 border-2 border-gray-700 text-white p-4 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 appearance-none cursor-pointer shadow-inner pr-12"
                  required
                >
                  <option value="" className="text-gray-500 bg-gray-800">اختر المرحلة...</option>
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

            {/* الترتيب */}
            <div className="bg-gray-750 p-5 rounded-2xl border border-gray-600">
              <label className="block text-gray-200 mb-3 text-sm font-semibold">الترتيب</label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="أدخل ترتيب المادة..."
                className="bg-gray-800 border-2 border-gray-700 text-white p-4 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 shadow-inner"
                min="1"
              />
            </div>

            {/* الحالة */}
            <div className="bg-gray-750 p-5 rounded-2xl border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-gray-200 font-semibold">حالة المادة</span>
                  <p className="text-gray-400 text-sm mt-1">تفعيل أو تعطيل المادة</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.active === '1'}
                    onChange={(checked) => setFormData(prev => ({ ...prev, active: checked ? '1' : '0' }))}
                    className={`${formData.active === '1' ? 'bg-green-500' : 'bg-gray-600'} relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-md`}
                  >
                    <span className={`${formData.active === '1' ? 'translate-x-7' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg`} />
                  </Switch>
                  <span className={`font-semibold ${formData.active === '1' ? 'text-green-400' : 'text-red-400'}`}>
                    {formData.active === '1' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>

            {/* صورة المادة */}
            <div className="bg-gray-750 p-5 rounded-2xl border border-gray-600">
              <label className="block text-gray-200 mb-3 text-sm font-semibold">صورة المادة</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 bg-gray-800">
                <div className="text-center mb-4">
                  <FiImage className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-2">اسحب وأفلت الصورة هنا أو</p>
                </div>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 font-medium shadow-lg">
                  <span>اختر صورة</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                <p className="text-gray-500 text-xs mt-4">PNG, JPG, GIF - الحد الأقصى 10MB</p>
              </div>
              
              {imagePreview && (
                <div className="mt-6 p-5 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-200 text-sm font-semibold">معاينة الصورة:</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }))
                        setImagePreview(null)
                      }}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors duration-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      إزالة الصورة
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="w-24 h-24 object-cover rounded-xl border-2 border-gray-600 shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-500 font-semibold flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    {editingSubject ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        تحديث المادة
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-5 h-5" />
                        إضافة المادة
                      </>
                    )}
                  </span>
                )}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
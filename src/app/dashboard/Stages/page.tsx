// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FiPlus, FiEdit, FiTrash2, FiX, FiChevronUp, FiChevronDown, FiSearch, FiImage, FiFilter } from 'react-icons/fi'
import Layout from '@/components/Layout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export interface Stage {
  id: number
  name: string
  country: {id:number, name:string, image?: string} | null
  active: boolean
  image: string
  postion: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deleted: boolean
}

interface Field {
  key: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  type: 'text' | 'file'
  enabled: boolean
}

// --- Modal Component ---
const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 z-10 p-6 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-transform transform hover:scale-110">
            <FiX size={28} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// --- Country Select Component ---
interface Country {
  id: number
  name: string
  image?: string
}

interface CountrySelectProps {
  value: Country | null
  onChange: (country: Country) => void
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange }) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(()=>{
    let mounted = true
    fetch(`${API_URL}/country/index`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ filters:{}, orderBy:'id', orderByDirection:'asc', perPage:400, paginate:true })
    })
    .then(res=>res.json())
    .then(data=>{ if(mounted && data.status===200) setCountries(data.data || []) })
    .catch(err=>console.error(err))
    return ()=>{ mounted = false }
  },[])

  const filtered = countries.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value ? value.name : search}
        placeholder="اختر الدولة..."
        onClick={()=>setOpen(prev=>!prev)}
        onChange={e=>{
          setSearch(e.target.value)
          setOpen(true)
        }}
        className="w-full border border-gray-500 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-gray-700 text-gray-100"
      />
      {open && (
        <ul className="absolute z-50 bg-gray-900 border border-gray-700 rounded-md mt-1 max-h-60 overflow-y-auto w-full">
          {filtered.map(c=>(
            <li key={c.id}
              onClick={()=>{
                onChange(c)
                setOpen(false)
                setSearch('')
              }}
              className="flex items-center gap-2 p-2 hover:bg-gray-800 cursor-pointer"
            >
              {c.image && <img src={c.image} alt={c.name} className="w-6 h-4 object-contain"/>}
              <span>{c.name}</span>
            </li>
          ))}
          {filtered.length===0 && <li className="p-2 text-gray-400">لا توجد نتائج</li>}
        </ul>
      )}
    </div>
  )
}

// --- Main Page ---
export default function SubjectsPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [subjects, setSubjects] = useState<Stage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Stage>('name')
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Stage|null>(null)
  const [formFields, setFormFields] = useState<Field[]>([])
  const [imagePreview, setImagePreview] = useState<string|null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country|null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    country: '',
    active: '',
    minPosition: '',
    maxPosition: ''
  })

  const fetchStages = async () => {
    try {
      const res = await fetch(`${API_URL}/stage/index`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ filters:{}, orderBy:'id', orderByDirection:'asc', perPage:300, paginate:true, delete:false })
      })
      const data = await res.json()
      if(data.status===200) setStages(data.data || [])
      else toast.error('فشل في تحميل المراحل')
    } catch(err) { console.error(err); toast.error('حدث خطأ في تحميل المراحل') }
  }

  const fetchSubjects = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/stage/index`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ filters:{}, orderBy:'id', orderByDirection:'asc', perPage:300, paginate:true, delete:false })
      })
      const data = await res.json()
      if(data.status===200) setSubjects(data.data || [])
      else toast.error('فشل في تحميل المواد الدراسية')
    } catch(err) { console.error(err); toast.error('حدث خطأ في تحميل المواد الدراسية') }
    finally { setIsLoading(false) }
  }

  useEffect(()=>{
    fetchStages()
    fetchSubjects()
  },[])

  const createSubject = async (payload: FormData) => {
    try {
      const res = await fetch(`${API_URL}/stage`, { method:'POST', body: payload })
      const data = await res.json()
      if(data && (data.success === true || data.status === 200)) {
        toast.success(data.message || 'تمت الإضافة بنجاح')
        return true
      }
      if(data && data.errors) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(data.errors).forEach((arr:any)=>{
          (arr as string[]).forEach(msg=> toast.error(msg))
        })
      } else {
        toast.error(data.message || 'فشل في الإضافة')
      }
      return false
    } catch(err) { console.error(err); toast.error('حدث خطأ أثناء الإضافة'); return false }
  }

  const updateSubject = async (id:number, payload: FormData) => {
    try {
      const res = await fetch(`${API_URL}/stage/update/${id}`, { method:'POST', body: payload })
      const data = await res.json()
      if(data && (data.success === true || data.status === 200)) {
        toast.success(data.message || 'تم التحديث بنجاح')
        return true
      }
      if(data && data.errors) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(data.errors).forEach((arr:any)=>{
          (arr as string[]).forEach(msg=> toast.error(msg))
        })
      } else {
        toast.error(data.message || 'فشل في التحديث')
      }
      return false
    } catch(err) { console.error(err); toast.error('حدث خطأ أثناء التحديث'); return false }
  }

  const deleteSubject = async (id:number) => {
    if(!confirm('هل أنت متأكد من حذف هذه المادة؟')) return false
    try {
      const res = await fetch(`${API_URL}/stage/${id}`, { method:'DELETE' })
      const data = await res.json()
      if(data && (data.success === true || data.status === 200)) {
        toast.success(data.message || 'تم الحذف بنجاح')
        return true
      }
      toast.error(data.message || 'فشل في الحذف')
      return false
    } catch(err) { console.error(err); toast.error('حدث خطأ أثناء الحذف'); return false }
  }

  const openAddModal = () => {
    setEditingSubject(null)
    setSelectedCountry(null)
    setFormFields([
      { key:'name', value:'', type:'text', enabled:true },
      { key:'image', value:[], type:'file', enabled:true },
      { key:'postion', value:'1', type:'text', enabled:true },
      { key:'active', value:'1', type:'text', enabled:true }
    ])
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const openEditModal = (subject: Stage) => {
    setEditingSubject(subject)
    setSelectedCountry(subject.country || null)
    setFormFields([
      { key:'name', value:subject.name||'', type:'text', enabled:true },
      { key:'image', value:[], type:'file', enabled:true },
      { key:'postion', value:subject.postion?.toString()||'1', type:'text', enabled:true },
      { key:'active', value:subject.active?'1':'0', type:'text', enabled:true }
    ])
    setImagePreview(subject.image ? (subject.image.startsWith('http')?subject.image:`${API_URL}/${subject.image}`) : null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setImagePreview(null)
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (key:string, value:any) => {
    setFormFields(prev=>prev.map(f=>f.key===key?{...f,value}:f))
  }

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>, key:string) => {
    if(!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    handleFieldChange(key,[file])
    const reader = new FileReader()
    reader.onloadend = ()=>setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const nameField = formFields.find(f=>f.key==='name')
    if(!nameField?.value || !String(nameField.value).trim()) { toast.error('الاسم مطلوب'); setIsSubmitting(false); return }
    if(!selectedCountry) { toast.error('اختر الدولة'); setIsSubmitting(false); return }

    const payload = new FormData()
    formFields.forEach(f=>{
      if(!f.enabled) return
      if(f.type==='file' && f.value?.length) (f.value as File[]).forEach((file:File)=>payload.append(f.key,file))
      else payload.append(f.key,f.value)
    })
    payload.append('country_id', selectedCountry.id.toString())

    let ok = false
    if(editingSubject) ok = await updateSubject(editingSubject.id,payload)
    else ok = await createSubject(payload)

    setIsSubmitting(false)
    if(ok){
      await fetchSubjects()
      closeModal()
    }
  }

  const handleDelete = async (id:number) => {
    const ok = await deleteSubject(id)
    if(ok) await fetchSubjects()
  }

  // --- Filter & Sort ---
  const filteredSubjects = subjects.filter(subject => {
    // البحث النصي
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // تطبيق الفلاتر
    const matchesCountry = !filters.country || (subject.country && subject.country.id.toString() === filters.country)
    const matchesActive = !filters.active || subject.active.toString() === filters.active
    const matchesMinPosition = !filters.minPosition || (subject.postion !== null && subject.postion >= parseInt(filters.minPosition))
    const matchesMaxPosition = !filters.maxPosition || (subject.postion !== null && subject.postion <= parseInt(filters.maxPosition))
    
    return matchesSearch && matchesCountry && matchesActive && matchesMinPosition && matchesMaxPosition
  })

  const sortedSubjects = [...filteredSubjects].sort((a,b)=>{
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

  const handleSort = (field: keyof Stage) => {
    if(sortField===field) setSortDirection(prev=>prev==='asc'?'desc':'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const renderSortIcon=(field: keyof Stage)=>sortField!==field?null:(sortDirection==='asc'?<FiChevronUp size={16}/>:<FiChevronDown size={16}/>)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      country: '',
      active: '',
      minPosition: '',
      maxPosition: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  // جلب قائمة الدول للفلتر
  const [countries, setCountries] = useState<Country[]>([])
  useEffect(() => {
    fetch(`${API_URL}/country/index`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ filters:{}, orderBy:'name', orderByDirection:'asc', perPage:100, paginate:true, delete:false })
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === 200) setCountries(data.data || [])
    })
    .catch(err => console.error('Failed to fetch countries', err))
  }, [])

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen text-gray-100">
        <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
        <h1 className="text-3xl font-bold mb-6">إدارة المراحل الدراسية</h1>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="relative flex-grow max-w-md">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="ابحث باسم المرحلة..." 
              value={searchTerm} 
              onChange={e=>setSearchTerm(e.target.value)} 
              className="bg-gray-700 border border-gray-600 text-gray-200 p-3 rounded-xl w-full pl-12 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-xl shadow-lg transition-all duration-200 ${showFilters ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 text-white`}
            >
              <FiFilter className="ml-2" /> فلاتر
              {hasActiveFilters && (
                <span className="mr-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            <button onClick={openAddModal} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
              <FiPlus className="ml-2"/> إضافة مرحلة
            </button>
          </div>
        </div>

        {/* قسم الفلاتر */}
        {showFilters && (
          <div className="bg-gray-700 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">فلاتر البحث</h2>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-gray-300 hover:text-white flex items-center"
                  >
                    <FiX className="ml-1" /> إعادة الضبط
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الدولة</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                >
                  <option value="">جميع الدول</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange('active', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                >
                  <option value="">جميع الحالات</option>
                  <option value="1">نشط</option>
                  <option value="0">غير نشط</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أقل ترتيب</label>
                <input
                  type="number"
                  value={filters.minPosition}
                  onChange={(e) => handleFilterChange('minPosition', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أعلى ترتيب</label>
                <input
                  type="number"
                  value={filters.maxPosition}
                  onChange={(e) => handleFilterChange('maxPosition', e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2"
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* الجدول */}
        <div className="overflow-x-auto  rounded-2xl shadow-lg border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-3 cursor-pointer text-right" onClick={()=>handleSort('name')}>
                  <div className="flex items-center justify-end">
                    <span>الاسم</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-3 cursor-pointer text-right" onClick={()=>handleSort('country')}>
                  <div className="flex items-center justify-end">
                    <span>الدولة</span>
                    {renderSortIcon('country')}
                  </div>
                </th>
                <th className="px-6 py-3 cursor-pointer text-right" onClick={()=>handleSort('active')}>
                  <div className="flex items-center justify-end">
                    <span>الحالة</span>
                    {renderSortIcon('active')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right">الصورة</th>
                <th className="px-6 py-3 cursor-pointer text-right" onClick={()=>handleSort('postion')}>
                  <div className="flex items-center justify-end">
                    <span>الترتيب</span>
                    {renderSortIcon('postion')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right">الخيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-6">جارٍ التحميل...</td></tr>
              ) : sortedSubjects.length===0 ? (
                <tr><td colSpan={6} className="text-center p-6">لا توجد مراحل تطابق معايير البحث</td></tr>
              ) : sortedSubjects.map(stage=>(
                <tr key={stage.id} className="hover:bg-gray-700 transition-all">
                  <td className="px-6 py-4 text-right">{stage.name}</td>
                  <td className="px-6 py-4 text-right">{stage.country?.name || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${stage.active ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                      {stage.active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {stage.image ? <img src={stage.image.startsWith('http') ? stage.image : `${API_URL}/${stage.image}`} alt={stage.name} className="h-12 w-12 object-cover rounded-md mx-auto"/> : <FiImage size={20} className="mx-auto"/>}
                  </td>
                  <td className="px-6 py-4 text-right">{stage.postion ?? '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>openEditModal(stage)} className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg" title="تعديل">
                        <FiEdit/>
                      </button>
                      <button onClick={()=>handleDelete(stage.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg" title="حذف">
                        <FiTrash2/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSubject ? 'تعديل المرحلة' : 'إضافة مرحلة'}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formFields.map(f=>{
              if(f.type==='text') return (
                <div key={f.key} className="flex flex-col">
                  <label className="mb-1 capitalize">{f.key}</label>
                  <input type="text" value={f.value} onChange={e=>handleFieldChange(f.key,e.target.value)} className="p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100"/>
                </div>
              )
              if(f.type==='file') return (
                <div key={f.key} className="flex flex-col">
                  <label className="mb-1 capitalize">الصورة</label>
                  <input type="file" accept="image/*" onChange={e=>handleFileChange(e,f.key)} className="text-gray-100"/>
                  {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-32 object-cover rounded-lg"/>}
                </div>
              )
              return null
            })}
            <div>
              <label className="mb-1 block">الدولة</label>
              <CountrySelect value={selectedCountry} onChange={setSelectedCountry}/>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl">إلغاء</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl">
                {isSubmitting ? 'جاري الحفظ...' : (editingSubject ? 'تحديث' : 'حفظ')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
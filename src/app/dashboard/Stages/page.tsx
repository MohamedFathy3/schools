'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FiPlus, FiEdit, FiTrash2, FiX, FiChevronUp, FiChevronDown, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi'
import Layout from '@/components/Layout'

const API_URL = '/api';

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
  value: any
  type: 'text' | 'file'
  enabled: boolean
}

// --- Modal Component ---
const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-gray-900 z-10 p-6 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-all duration-300 transform hover:scale-110 hover:rotate-90">
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
        placeholder="Select country..."
        onClick={()=>setOpen(prev=>!prev)}
        onChange={e=>{
          setSearch(e.target.value)
          setOpen(true)
        }}
        className="w-full border border-gray-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 bg-gray-700 text-gray-100 transition-all duration-300"
      />
      {open && (
        <ul className="absolute z-50 bg-gray-900 border border-gray-700 rounded-xl mt-2 max-h-60 overflow-y-auto w-full shadow-2xl animate-fadeIn">
          {filtered.map(c=>(
            <li key={c.id}
              onClick={()=>{
                onChange(c)
                setOpen(false)
                setSearch('')
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:translate-x-2"
            >
              {c.image && <img src={c.image} alt={c.name} className="w-6 h-4 object-contain rounded"/>}
              <span className="text-gray-100">{c.name}</span>
            </li>
          ))}
          {filtered.length===0 && <li className="p-3 text-gray-400 text-center">No results found</li>}
        </ul>
      )}
    </div>
  )
}

// --- Toggle Switch Component ---
const ToggleSwitch = ({ 
  enabled, 
  onChange 
}: { 
  enabled: boolean
  onChange: (enabled: boolean) => Promise<void>
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onChange(!enabled)
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-500 ${
        enabled 
          ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30' 
          : 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-inner'
      } transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={handleToggle}
    >
      <span
        className={`inline-block h-5 w-5 transform bg-white rounded-full shadow-lg transition-all duration-500 ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </button>
  )
}

// --- Main Page ---
export default function StagesManagementPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Stage>('name')
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<Stage|null>(null)
  const [formFields, setFormFields] = useState<Field[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country|null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    country: '',
    active: '',
    minPosition: '',
    maxPosition: ''
  })

  // جلب قائمة الدول للفلتر
  const [countries, setCountries] = useState<Country[]>([])

  const fetchStages = async () => {
    try {
      const res = await fetch(`${API_URL}/stage/index`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ 
          filters: getApiFilters(), 
          orderBy: sortField, 
          orderByDirection: sortDirection, 
          perPage:300, 
          paginate:true, 
          delete:false 
        })
      })
      const data = await res.json()
      if(data.status===200) {
        setStages(data.data || [])
      } else {
        toast.error('Failed to load stages')
      }
    } catch(err) { 
      console.error(err); 
      toast.error('Error loading stages') 
    }
  }

  const getApiFilters = () => {
    const apiFilters: any = {}
    if (filters.country) apiFilters.country_id = filters.country
    if (filters.active !== '') apiFilters.active = filters.active
    if (filters.minPosition) apiFilters.postion_min = filters.minPosition
    if (filters.maxPosition) apiFilters.postion_max = filters.maxPosition
    if (searchTerm) apiFilters.name = searchTerm
    return apiFilters
  }

  useEffect(() => {
    fetchStages()
    // جلب الدول للفلتر
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
  }, [sortField, sortDirection, filters, searchTerm])

  const createStage = async (payload: FormData) => {
    try {
      const res = await fetch(`${API_URL}/stage`, { method:'POST', body: payload })
      const data = await res.json()
      if(data && (data.success === true || data.status === 200)) {
        toast.success(data.message || 'Stage added successfully! 🎉')
        return true
      }
      if(data && data.errors) {
        Object.values(data.errors).forEach((arr:any)=>{
          (arr as string[]).forEach(msg=> toast.error(msg))
        })
      } else {
        toast.error(data.message || 'Failed to add stage')
      }
      return false
    } catch(err) { 
      console.error(err); 
      toast.error('Error while adding stage'); 
      return false 
    }
  }

  const updateStage = async (id:number, payload: FormData) => {
    try {
      const res = await fetch(`${API_URL}/stage/update/${id}`, { method:'POST', body: payload })
      const data = await res.json()
      if(data && (data.success === true || data.status === 200)) {
        toast.success(data.message || 'Stage updated successfully! ✨')
        return true
      }
      if(data && data.errors) {
        Object.values(data.errors).forEach((arr:any)=>{
          (arr as string[]).forEach(msg=> toast.error(msg))
        })
      } else {
        toast.error(data.message || 'Failed to update stage')
      }
      return false
    } catch(err) { 
      console.error(err); 
      toast.error('Error while updating stage'); 
      return false 
    }
  }

const toggleStageActive = async (id: number, active: boolean) => {
  const originalStages = [...stages]
  
  // تحديث فوري في الـ UI
  setStages(prev => prev.map(stage =>
    stage.id === id ? { ...stage, active } : stage
  ))
  
  try {
    const stageToUpdate = stages.find(stage => stage.id === id)
    
    if (!stageToUpdate) {
      throw new Error('Stage not found')
    }

    // نرسل كل البيانات المطلوبة مع الـ active
    const payload = {
      active: active ? 1 : 0,
      name: stageToUpdate.name,
      postion: stageToUpdate.postion || 1,
      country_id: stageToUpdate.country?.id
    }

    console.log('🔐 Sending complete payload:', payload)

    // جرب الـ endpoints المختلفة
    const endpoints = [
      `${API_URL}/stage/update/${id}`,
      `${API_URL}/stage/${id}/active`
    ]

    let success = false

    for (const endpoint of endpoints) {
      try {
        console.log(`🔐 Trying endpoint: ${endpoint}`)
        
        const res = await fetch(endpoint, {
          method: endpoint.includes('update') ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
        
        const data = await res.json()
        console.log('📡 Response:', data)
        
        if (data.status === 200 || data.success) {
          success = true
          toast.success(`Stage ${active ? 'activated' : 'deactivated'} successfully! 🎉`)
          break
        }
      } catch (err) {
        console.error(`Endpoint ${endpoint} failed:`, err)
      }
    }

    if (!success) {
      throw new Error('All endpoints failed')
    }

  } catch (err) {
    // الرجوع للحالة الأصلية إذا فشل الطلب
    setStages(originalStages)
    toast.error('Failed to update stage status')
    console.error('Toggle active error:', err)
  }
}

  const deleteStage = async (id:number) => {
    if(!confirm('Are you sure you want to delete this stage?')) return false
    try {
      const res = await fetch(`${API_URL}/stage/delete`, { 
        method:'DELETE', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ items:[id] }) 
      })
      const data = await res.json()
      if(data && (data.success === true || data.status === 200)) {
        toast.success('Stage deleted successfully! 🗑️')
        return true
      }
      toast.error(data.message || 'Failed to delete stage')
      return false
    } catch(err) { 
      console.error(err); 
      toast.error('Error while deleting stage'); 
      return false 
    }
  }

  const openAddModal = () => {
    setEditingStage(null)
    setSelectedCountry(null)
    setFormFields([
      { key:'name', value:'', type:'text', enabled:true },
      { key:'postion', value:'1', type:'text', enabled:true },
      { key:'active', value:'1', type:'text', enabled:true }
    ])
    setIsModalOpen(true)
  }

  const openEditModal = (stage: Stage) => {
    setEditingStage(stage)
    setSelectedCountry(stage.country || null)
    setFormFields([
      { key:'name', value:stage.name||'', type:'text', enabled:true },
      { key:'postion', value:stage.postion?.toString()||'1', type:'text', enabled:true },
      { key:'active', value:stage.active?'1':'0', type:'text', enabled:true }
    ])
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleFieldChange = (key:string, value:any) => {
    setFormFields(prev=>prev.map(f=>f.key===key?{...f,value}:f))
  }

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const nameField = formFields.find(f=>f.key==='name')
    if(!nameField?.value || !String(nameField.value).trim()) { 
      toast.error('Name is required'); 
      setIsSubmitting(false); 
      return 
    }
    if(!selectedCountry) { 
      toast.error('Please select country'); 
      setIsSubmitting(false); 
      return 
    }

    const payload = new FormData()
    formFields.forEach(f=>{
      if(!f.enabled) return
      payload.append(f.key, f.value)
    })
    payload.append('country_id', selectedCountry.id.toString())

    let success = false
    if(editingStage) {
      success = await updateStage(editingStage.id, payload)
    } else {
      success = await createStage(payload)
    }

    setIsSubmitting(false)
    if(success){
      await fetchStages()
      closeModal()
    }
  }

  const handleDelete = async (id:number) => {
    const ok = await deleteStage(id)
    if(ok) await fetchStages()
  }

  // --- Filter & Sort ---
  const sortedStages = [...stages].sort((a,b)=>{
    const aVal = (a[sortField] as any) ?? ''
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

  const renderSortIcon=(field: keyof Stage)=>sortField!==field?null:(
    sortDirection==='asc'?<FiChevronUp size={16} className="text-blue-400"/>:<FiChevronDown size={16} className="text-blue-400"/>
  )

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
    setSearchTerm('')
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm

  return (
    <Layout>
      <div className="p-6 bg-gray-800 min-h-screen text-gray-100">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="dark"
          toastClassName="!bg-gray-800 !border !border-gray-700 !text-white !rounded-2xl"
        />
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stages Management
            </h1>
            <p className="text-gray-400">
              Total Stages: {sortedStages.length}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by stage name..." 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                className="bg-gray-700 border-2 border-gray-600 text-white p-4 rounded-2xl pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 w-80 focus:shadow-lg focus:shadow-blue-500/20"
              />
            </div>
            
            {/* Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  hasActiveFilters 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600'
                }`}
              >
                <FiFilter className="ml-2" /> 
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 font-bold">
                    !
                  </span>
                )}
              </button>
            </div>
            
            {/* Add Button */}
            <button 
              onClick={openAddModal} 
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/30"
            >
              <FiPlus className="ml-2" /> Add Stage
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-gray-700 rounded-2xl p-6 mb-6 animate-fadeIn border border-gray-600 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Search Filters</h2>
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="flex items-center text-sm text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-xl"
                  >
                    <FiRefreshCw className="ml-1" /> Reset All
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 bg-gray-600 hover:bg-gray-500 p-2 rounded-xl"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="animate-slideUp" style={{animationDelay: '0.1s'}}>
                <label className="block text-sm font-medium mb-2 text-gray-300">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-gray-600 border-2 border-gray-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-white"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div className="animate-slideUp" style={{animationDelay: '0.2s'}}>
                <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange('active', e.target.value)}
                  className="w-full bg-gray-600 border-2 border-gray-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-white"
                >
                  <option value="">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              <div className="animate-slideUp" style={{animationDelay: '0.3s'}}>
                <label className="block text-sm font-medium mb-2 text-gray-300">Min Position</label>
                <input
                  type="number"
                  value={filters.minPosition}
                  onChange={(e) => handleFilterChange('minPosition', e.target.value)}
                  className="w-full bg-gray-600 border-2 border-gray-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-white"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="animate-slideUp" style={{animationDelay: '0.4s'}}>
                <label className="block text-sm font-medium mb-2 text-gray-300">Max Position</label>
                <input
                  type="number"
                  value={filters.maxPosition}
                  onChange={(e) => handleFilterChange('maxPosition', e.target.value)}
                  className="w-full bg-gray-600 border-2 border-gray-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-white"
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

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
                    <span>Stage Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/4">Country</th>
                <th className="px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/6">Position</th>
                <th className="px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/6">Status</th>
                <th className="px-6 py-5 text-right font-bold text-lg uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {sortedStages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 animate-fadeIn">
                      <FiSearch size={64} className="mb-4 opacity-30" />
                      <p className="text-2xl mb-2 font-light">No stages found</p>
                      <p className="text-gray-500 text-lg">No stages match your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStages.map((stage, index) => (
                  <tr 
                    key={stage.id} 
                    className="transition-all duration-500 hover:bg-gray-600 group animate-fadeIn"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors duration-300">
                        {stage.name}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        {stage.country?.image && (
                          <img src={stage.country.image} alt={stage.country.name} className="w-6 h-4 object-cover rounded" />
                        )}
                        <span className="text-gray-200">{stage.country?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                        {stage.postion ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-3 space-x-reverse">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          stage.active 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {stage.active ? 'Active' : 'Inactive'}
                        </span>
                        <ToggleSwitch 
                          enabled={stage.active} 
                          onChange={(enabled) => toggleStageActive(stage.id, enabled)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={()=>openEditModal(stage)} 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-yellow-500/30 active:scale-95"
                          title="Edit"
                        >
                          <FiEdit size={18}/>
                        </button>
                        <button 
                          onClick={()=>handleDelete(stage.id)} 
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-red-500/30 active:scale-95"
                          title="Delete"
                        >
                          <FiTrash2 size={18}/>
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
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStage ? 'Edit Stage' : 'Add New Stage'}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {formFields.map(field=>(
              <div key={field.key} className="flex flex-col animate-fadeIn">
                <label className="mb-2 font-medium text-gray-300 capitalize">
                  {field.key === 'postion' ? 'Position' : field.key}
                </label>
                {field.type === 'text' && field.key === 'active' ? (
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl border-2 border-gray-600">
                    <span className={`font-bold ${field.value === '1' ? 'text-green-400' : 'text-red-400'}`}>
                      {field.value === '1' ? 'Active' : 'Inactive'}
                    </span>
                    <ToggleSwitch 
                      enabled={field.value === '1'} 
                      onChange={async (enabled) => {
                        handleFieldChange('active', enabled ? '1' : '0')
                      }}
                    />
                  </div>
                ) : (
                  <input 
                    type={field.type} 
                    value={field.value} 
                    onChange={e=>handleFieldChange(field.key, e.target.value)} 
                    className="p-3 rounded-xl bg-gray-700 border-2 border-gray-600 text-gray-100 focus:outline-none focus:border-blue-500 transition-all duration-300"
                    placeholder={`Enter ${field.key}`}
                  />
                )}
              </div>
            ))}
            
            <div className="animate-fadeIn">
              <label className="mb-2 block font-medium text-gray-300">Country *</label>
              <CountrySelect value={selectedCountry} onChange={setSelectedCountry}/>
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  editingStage ? 'Update Stage' : 'Add Stage'
                )}
              </button>
            </div>
          </form>
        </Modal>

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
            animation: fadeIn 0.5s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </Layout>
  )
}
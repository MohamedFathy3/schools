// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  type: 'text' | 'file'
  enabled: boolean
}

// --- Modal Component ---
const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:scale-110">
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
        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-blue-500 bg-white text-gray-800 transition-all duration-300"
      />
      {open && (
        <ul className="absolute z-50 bg-white border border-gray-200 rounded-xl mt-2 max-h-60 overflow-y-auto w-full shadow-2xl animate-fadeIn">
          {filtered.map(c=>(
            <li key={c.id}
              onClick={()=>{
                onChange(c)
                setOpen(false)
                setSearch('')
              }}
              className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0"
            >
              {c.image && <img src={c.image} alt={c.name} className="w-6 h-4 object-contain rounded"/>}
              <span className="text-gray-800">{c.name}</span>
            </li>
          ))}
          {filtered.length===0 && <li className="p-3 text-gray-500 text-center">No results found</li>}
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
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 ${
        enabled 
          ? 'bg-blue-600 shadow-lg shadow-blue-500/30' 
          : 'bg-gray-300 shadow-inner'
      } transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={handleToggle}
    >
      <span
        className={`inline-block h-5 w-5 transform bg-white rounded-full shadow-lg transition-all duration-300 ${
          enabled ? 'translate-x-7' : 'translate-x-0.5'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    setStages(prev => prev.map(stage =>
      stage.id === id ? { ...stage, active } : stage
    ))
    
    try {
      const stageToUpdate = stages.find(stage => stage.id === id)
      
      if (!stageToUpdate) {
        throw new Error('Stage not found')
      }

      const payload = {
        active: active ? 1 : 0,
        name: stageToUpdate.name,
        postion: stageToUpdate.postion || 1,
        country_id: stageToUpdate.country?.id
      }

      const endpoints = [
        `${API_URL}/stage/update/${id}`,
        `${API_URL}/stage/${id}/active`
      ]

      let success = false

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: endpoint.includes('update') ? 'POST' : 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          })
          
          const data = await res.json()
          
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const renderSortIcon=(field: keyof Stage)=>sortField!==field?null:(
    sortDirection==='asc'?<FiChevronUp size={16} className="text-blue-600"/>:<FiChevronDown size={16} className="text-blue-600"/>
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
      <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="light"
          toastClassName="!bg-white !border !border-gray-200 !text-gray-800 !rounded-xl !shadow-lg"
        />
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Stages Management
            </h1>
            <p className="text-gray-600">
              Total Stages: <span className="font-semibold text-blue-600">{sortedStages.length}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by stage name..." 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                className="bg-white border border-gray-300 text-gray-800 p-3 rounded-xl pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 w-80 focus:shadow-lg"
              />
            </div>
            
            {/* Filter Button */}
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 rounded-xl shadow-sm transition-all duration-300 ${
                  hasActiveFilters 
                    ? 'bg-blue-600 text-white shadow-blue-500/30' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
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
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="ml-2" /> Add Stage
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Search Filters</h2>
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-all duration-300 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
                  >
                    <FiRefreshCw className="ml-1" /> Reset All
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-300 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-gray-800"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange('active', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-gray-800"
                >
                  <option value="">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Min Position</label>
                <input
                  type="number"
                  value={filters.minPosition}
                  onChange={(e) => handleFilterChange('minPosition', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-gray-800"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Max Position</label>
                <input
                  type="number"
                  value={filters.maxPosition}
                  onChange={(e) => handleFilterChange('maxPosition', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-all duration-300 text-gray-800"
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full table-auto text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  onClick={() => handleSort('name')} 
                  className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider w-1/4 group transition-all duration-300 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span>Stage Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider w-1/4">Country</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider w-1/6">Position</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider w-1/6">Status</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FiSearch size={48} className="mb-3 opacity-40" />
                      <p className="text-lg mb-1 font-medium">No stages found</p>
                      <p className="text-gray-400 text-sm">No stages match your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStages.map((stage, index) => (
                  <tr 
                    key={stage.id} 
                    className="transition-all duration-300 hover:bg-blue-50 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                        {stage.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {stage.country?.image && (
                          <img src={stage.country.image} alt={stage.country.name} className="w-6 h-4 object-cover rounded" />
                        )}
                        <span className="text-gray-700">{stage.country?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
                        {stage.postion ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          stage.active 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {stage.active ? 'Active' : 'Inactive'}
                        </span>
                        <ToggleSwitch 
                          enabled={stage.active} 
                          onChange={(enabled) => toggleStageActive(stage.id, enabled)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={()=>openEditModal(stage)} 
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
                          title="Edit"
                        >
                          <FiEdit size={16}/>
                        </button>
                        <button 
                          onClick={()=>handleDelete(stage.id)} 
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
                          title="Delete"
                        >
                          <FiTrash2 size={16}/>
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formFields.map(field=>(
              <div key={field.key} className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700 capitalize">
                  {field.key === 'postion' ? 'Position' : field.key}
                </label>
                {field.type === 'text' && field.key === 'active' ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                    <span className={`font-semibold ${field.value === '1' ? 'text-green-600' : 'text-red-600'}`}>
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
                    className="p-3 rounded-lg bg-white border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500 transition-all duration-300"
                    placeholder={`Enter ${field.key}`}
                  />
                )}
              </div>
            ))}
            
            <div>
              <label className="mb-2 block font-medium text-gray-700">Country *</label>
              <CountrySelect value={selectedCountry} onChange={setSelectedCountry}/>
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </Layout>
  )
}
'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch, FiFilter, FiClock, FiPercent, FiDollarSign, FiUser, FiCalendar } from 'react-icons/fi'
import Layout from '@/components/Layout'

interface Coupon {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number
  used_count?: number
  starts_at: string
  expires_at: string
  active: boolean
  created_at: string
  updated_at: string
}

interface FormData {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number
  starts_at: string
  expires_at: string
  active: boolean
}

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-all duration-300">
            <FiX size={28} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

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
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-all duration-300 ${
        enabled 
          ? 'bg-blue-600 shadow-lg shadow-blue-500/30' 
          : 'bg-gray-300 shadow-inner'
      } transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={handleToggle}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-lg transition-all duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </button>
  )
}

export default function CouponsManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const [formData, setFormData] = useState<FormData>({
    code: '',
    type: 'percentage',
    value: 0,
    max_uses: 100,
    starts_at: '',
    expires_at: '',
    active: true
  })

  const API_URL = '/api'

  // Fetch coupons
  const fetchCoupons = async (page = 1) => {
    try {
      const res = await fetch(`${API_URL}/coupon/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: getApiFilters(),
          orderBy: 'created_at',
          orderByDirection: 'desc',
          perPage: 10,
          paginate: true,
          delete: false,
          page
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setCoupons(data.data || [])
        setCurrentPage(data.meta.current_page)
        setLastPage(data.meta.last_page)
      } else {
        toast.error('Failed to load coupons')
      }
    } catch (err) {
      console.error('Fetch coupons error:', err)
      toast.error('Error loading coupons')
    }
  }

  const getApiFilters = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiFilters: any = {}
    if (searchTerm) apiFilters.code = searchTerm
    if (typeFilter !== 'all') apiFilters.type = typeFilter
    if (statusFilter !== 'all') apiFilters.active = statusFilter === 'active'
    return apiFilters
  }

  useEffect(() => {
    fetchCoupons()
  }, [searchTerm, typeFilter, statusFilter])

  // CRUD Operations
  const createCoupon = async (payload: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        return true
      } else {
        toast.error(data.message || 'Failed to create coupon')
        return false
      }
    } catch (err) {
      console.error('Create coupon error:', err)
      toast.error('Error creating coupon')
      return false
    }
  }

  const updateCoupon = async (id: number, payload: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/coupon/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
          toast.error(data.message || 'Failed to update coupon')
        }
        return false
      }
    } catch (err) {
      console.error('Update coupon error:', err)
      toast.error('Error updating coupon')
      return false
    }
  }

const toggleCouponActive = async (id: number, active: boolean): Promise<void> => {
  const originalCoupons = [...coupons]
  
  // تحديث فوري للـ UI
  setCoupons(prev => prev.map(coupon =>
    coupon.id === id ? { ...coupon, active } : coupon
  ))
  
  try {
    const res = await fetch(`${API_URL}/coupon/${id}/active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    })
    
    const data = await res.json()

    // 🔥 الحل: أي response بيكون ok نعتبره نجاح
    if (res.ok) {
      toast.success(data.message || `Coupon ${active ? 'activated' : 'deactivated'} successfully! 🎉`)
    } else {
      throw new Error(data.message || 'Failed to update coupon status')
    }
  } catch (err) {
    // التراجع عن التغيير في الـ UI
    setCoupons(originalCoupons)
    toast.error('Failed to update coupon status')
    console.error('Toggle active error:', err)
  }
}

  const deleteCoupon = async (id: number): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this coupon?')) return false
    
    try {
      const res = await fetch(`${API_URL}/coupon/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [id] })
      })
      
      const data = await res.json()
      
      if (data.status === 200 || data.success) {
        toast.success('Coupon deleted successfully! 🗑️')
        await fetchCoupons()
        return true
      } else {
        toast.error(data.message || 'Failed to delete coupon')
        return false
      }
    } catch (err) {
      console.error('Delete coupon error:', err)
      toast.error('Error deleting coupon')
      return false
    }
  }

  // Modal Handlers
  const openAddModal = () => {
    setEditingCoupon(null)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 30)
    
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      max_uses: 100,
      starts_at: now.toISOString().slice(0, 16),
      expires_at: tomorrow.toISOString().slice(0, 16),
      active: true
    })
    setIsModalOpen(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      max_uses: coupon.max_uses,
      starts_at: coupon.starts_at.slice(0, 16),
      expires_at: coupon.expires_at.slice(0, 16),
      active: coupon.active
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validation
    if (!formData.code.trim()) {
      toast.error('Coupon code is required')
      setIsSubmitting(false)
      return
    }
    if (formData.value <= 0) {
      toast.error('Discount value must be greater than 0')
      setIsSubmitting(false)
      return
    }
    if (formData.max_uses <= 0) {
      toast.error('Max uses must be greater than 0')
      setIsSubmitting(false)
      return
    }
    if (!formData.starts_at || !formData.expires_at) {
      toast.error('Start and expiration dates are required')
      setIsSubmitting(false)
      return
    }

    let success = false
    
    if (editingCoupon) {
      success = await updateCoupon(editingCoupon.id, formData)
    } else {
      success = await createCoupon(formData)
    }

    setIsSubmitting(false)
    
    if (success) {
      toast.success(
        editingCoupon ? 'Coupon updated successfully! ✨' : 'Coupon created successfully! 🎉'
      )
      await fetchCoupons()
      closeModal()
    }
  }

  // Filtering
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && coupon.active) ||
                         (statusFilter === 'inactive' && !coupon.active)
    return matchesSearch && matchesType && matchesStatus
  })

  const isCouponExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date()
    const startsAt = new Date(coupon.starts_at)
    const expiresAt = new Date(coupon.expires_at)
    return coupon.active && now >= startsAt && now <= expiresAt
  }

  const getUsagePercentage = (coupon: Coupon) => {
    return coupon.used_count ? (coupon.used_count / coupon.max_uses) * 100 : 0
  }

  return (
    <Layout>
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="light"
        />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Coupons Management
            </h1>
            <p className="text-gray-600 text-lg">
              Total Coupons: <span className="font-bold text-blue-600">{filteredCoupons.length}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search coupon codes..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full bg-white border-2 border-gray-300 text-gray-800 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={typeFilter}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={e => setTypeFilter(e.target.value as any)}
              className="bg-white border-2 border-gray-300 text-gray-800 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-white border-2 border-gray-300 text-gray-800 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            {/* Add Button */}
            <button 
              onClick={openAddModal} 
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <FiPlus className="mr-2" /> Create Coupon
            </button>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCoupons.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <FiSearch size={64} className="mb-4 text-gray-300" />
                <p className="text-2xl mb-2 font-light text-gray-400">No coupons found</p>
                <p className="text-gray-400">Try adjusting your search or create a new coupon</p>
              </div>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isActive = isCouponActive(coupon)
              const isExpired = isCouponExpired(coupon.expires_at)
              const usagePercentage = getUsagePercentage(coupon)
              
              return (
                <div key={coupon.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
                  {/* Coupon Header */}
                  <div className={`p-6 ${
                    isActive ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    isExpired ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {coupon.type === 'percentage' ? (
                          <FiPercent className="w-6 h-6 text-white" />
                        ) : (
                          <FiDollarSign className="w-6 h-6 text-white" />
                        )}
                        <span className="text-white font-bold text-xl">{coupon.code}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isActive ? 'bg-green-100 text-green-800' :
                        isExpired ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="text-white text-3xl font-bold mb-2">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                      <span className="text-lg font-normal ml-2">OFF</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        <span>{coupon.used_count || 0} / {coupon.max_uses} uses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>Expires {new Date(coupon.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Usage Progress */}
                  <div className="px-6 pt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          usagePercentage >= 100 ? 'bg-red-500' :
                          usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {usagePercentage.toFixed(1)}% used
                    </div>
                  </div>
                  
                  {/* Coupon Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium capitalize">{coupon.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Starts:</span>
                        <p className="font-medium">{new Date(coupon.starts_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Uses:</span>
                        <p className="font-medium">{coupon.max_uses}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Expires:</span>
                        <p className="font-medium">{new Date(coupon.expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Status:</span>
                        <ToggleSwitch 
                          enabled={coupon.active} 
                          onChange={(enabled) => toggleCouponActive(coupon.id, enabled)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
                          title="Edit Coupon"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
                          title="Delete Coupon"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchCoupons(currentPage - 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700">
              Page {currentPage} of {lastPage}
            </span>
            <button
              disabled={currentPage === lastPage}
              onClick={() => fetchCoupons(currentPage + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code */}
            <div>
              <label className="block text-gray-800 mb-2 text-lg font-semibold">Coupon Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Enter coupon code (e.g., SAVE10)"
                className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-800 mb-2 text-lg font-semibold">Discount Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-800 mb-2 text-lg font-semibold">
                  Discount Value * 
                  {formData.type === 'percentage' ? ' (%)' : ' ($)'}
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder={formData.type === 'percentage' ? '10' : '50'}
                  min="1"
                  max={formData.type === 'percentage' ? '100' : '10000'}
                  className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-gray-800 mb-2 text-lg font-semibold">Maximum Uses *</label>
              <input
                type="number"
                name="max_uses"
                value={formData.max_uses}
                onChange={handleInputChange}
                placeholder="100"
                min="1"
                max="100000"
                className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-800 mb-2 text-lg font-semibold">Start Date *</label>
                <input
                  type="datetime-local"
                  name="starts_at"
                  value={formData.starts_at}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-800 mb-2 text-lg font-semibold">Expiration Date *</label>
                <input
                  type="datetime-local"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-gray-300 text-gray-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div>
                <span className="block text-gray-800 font-semibold text-lg">Coupon Status</span>
                <p className="text-gray-600 text-sm mt-1">Activate or deactivate this coupon</p>
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch 
                  enabled={formData.active} 
                  onChange={async (enabled) => {
                    setFormData(prev => ({ ...prev, active: enabled }))
                  }}
                />
                <span className={`font-semibold ${formData.active ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {editingCoupon ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  editingCoupon ? 'Update Coupon' : 'Create Coupon'
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
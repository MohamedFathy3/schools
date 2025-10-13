'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { FiSearch, FiEye, FiFilter, FiX, FiUsers, FiPlus, FiRefreshCw } from 'react-icons/fi'
import Layout from '@/components/Layout'
import { useRouter } from 'next/navigation'

const API_URL = '/api';

interface Teacher {
  id: number
  name: string
  email: string
  phone: string
  national_id: string
  wallets_name: string
  wallets_number: string
  active: boolean
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    active: undefined as boolean | undefined,
    orderBy: 'id' as 'id' | 'name' | 'email',
    orderByDirection: 'asc' as 'asc' | 'desc'
  })

  const router = useRouter()

  const fetchTeachers = async (page = 1, filterParams = filters) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/teacher/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            name: filterParams.name,
            email: filterParams.email,
            phone: filterParams.phone,
            active: filterParams.active
          },
          orderBy: filterParams.orderBy,
          orderByDirection: filterParams.orderByDirection,
          perPage: 10,
          paginate: true,
          delete: false,
          page
        })
      })
      const data = await res.json()
      if (data.status === 200) {
        setTeachers(data.data || [])
        setCurrentPage(data.meta.current_page)
        setLastPage(data.meta.last_page)
      } else toast.error('Failed to load data')
    } catch (err) {
      console.error(err)
      toast.error('Error loading teachers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const toggleActive = async (teacher: Teacher) => {
    const newActiveState = !teacher.active
    
    setTeachers(prev =>
      prev.map(t => 
        t.id === teacher.id 
          ? { ...t, active: newActiveState } 
          : t
      )
    )

    try {
      const res = await fetch(`${API_URL}/teacher/${teacher.id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active: newActiveState }),
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (res.ok && (data.success === undefined || data.success === true)) {
        toast.success(
          newActiveState ? 'Account activated successfully' : 'Account deactivated successfully',
          {
            position: "top-right",
            autoClose: 3000,
            className: 'bg-white text-gray-800 border border-gray-200 shadow-lg rounded-xl'
          }
        )
      } else {
        setTeachers(prev =>
          prev.map(t => 
            t.id === teacher.id 
              ? { ...t, active: teacher.active } 
              : t
          )
        )
        toast.error(data.message || 'Failed to update status')
      }
    } catch (err) {
      console.error(err)
      setTeachers(prev =>
        prev.map(t => 
          t.id === teacher.id 
            ? { ...t, active: teacher.active } 
            : t
        )
      )
      toast.error('Error updating status')
    }
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setCurrentPage(1)
    fetchTeachers(1, filters)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    const defaultFilters = {
      name: '',
      email: '',
      phone: '',
      active: undefined,
      orderBy: 'id' as const,
      orderByDirection: 'asc' as const
    }
    setFilters(defaultFilters)
    setCurrentPage(1)
    fetchTeachers(1, defaultFilters)
  }

  const hasActiveFilters = filters.name || filters.email || filters.phone || filters.active !== undefined

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto px-6 py-8">
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            theme="light"
            toastClassName="rounded-xl border border-gray-200 shadow-sm"
            progressClassName="bg-blue-500"
          />
          
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-lg border border-blue-100">
                  <FiUsers className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Teachers Management
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="text-sm">Total Teachers:</span>
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-sm">
                      {teachers.length}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Enhanced Search */}
                <div className="relative">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search teachers by name, email or phone..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full lg:w-80 pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium ${
                      isFilterOpen || hasActiveFilters
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => fetchTeachers()}
                    disabled={isLoading}
                    className="px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>

               
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Teachers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teachers.filter(t => t.active).length}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactive Teachers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teachers.filter(t => !t.active).length}
                    </p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pages</p>
                    <p className="text-2xl font-bold text-gray-900">{lastPage}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FiUsers className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Page</p>
                    <p className="text-2xl font-bold text-gray-900">{currentPage}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm font-bold text-purple-600">PG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Section */}
          <div className={`transition-all duration-500 overflow-hidden ${
            isFilterOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={filters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Search by phone..."
                    value={filters.phone}
                    onChange={(e) => handleFilterChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.active === undefined ? '' : String(filters.active)}
                    onChange={(e) => handleFilterChange('active', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-blue-800 font-bold text-sm uppercase tracking-wider">Teacher Name</th>
                    <th className="px-6 py-5 text-left text-blue-800 font-bold text-sm uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-5 text-left text-blue-800 font-bold text-sm uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-5 text-center text-blue-800 font-bold text-sm uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-center text-blue-800 font-bold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-gray-500 text-lg">Loading teachers data...</p>
                          <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
                        </div>
                      </td>
                    </tr>
                  ) : teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-12">
                        <div className="flex flex-col items-center justify-center">
                          <FiUsers className="text-4xl text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg mb-2">No teachers found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-blue-50/50 transition-all duration-200 group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {teacher.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{teacher.name}</div>
                              <div className="text-sm text-gray-500">ID: {teacher.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-gray-700 font-medium">{teacher.email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-gray-700 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                            {teacher.phone}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => toggleActive(teacher)}
                              className={`relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
                                teacher.active 
                                  ? 'bg-green-500 shadow-green-200' 
                                  : 'bg-gray-300 shadow-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 ${
                                  teacher.active 
                                    ? 'translate-x-8' 
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              teacher.active 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {teacher.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl font-medium group"
                              onClick={() => router.push(`/dashboard/pandding_Teachers/${teacher.id}`)}
                            >
                              <FiEye className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                              <span>View Details</span>
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

          {/* Enhanced Pagination */}
          {lastPage > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
              <p className="text-gray-600 text-sm">
                Showing page {currentPage} of {lastPage} • {teachers.length} teachers
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchTeachers(currentPage - 1)}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchTeachers(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all duration-200 font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {lastPage > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => fetchTeachers(currentPage + 1)}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
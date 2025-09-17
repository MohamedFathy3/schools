// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FiSearch, FiEye, FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi'
import Layout from '@/components/Layout'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

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
    setIsLoading(false)
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
          perPage: 5,
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
      } else toast.error('فشل في تحميل البيانات')
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء تحميل المعلمين')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])


const toggleActive = async (teacher: Teacher) => {
  try {
    const res = await fetch(`${API_URL}/teacher/${teacher.id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active: !teacher.active }),
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await res.json()

    if (res.ok && (data.success === undefined || data.success === true)) {
      setTeachers(prev =>
        prev.map(t => (t.id === teacher.id ? { ...t, active: !t.active } : t))
      )
      toast.success(data.message || 'تم تعديل الحالة بنجاح')
    } else {
      toast.error(data.message || 'فشل في تعديل الحالة')
    }
  } catch (err) {
    console.error(err)
    toast.error('حدث خطأ أثناء تعديل الحالة')
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
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
        <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">قائمة المعلمين</h1>
            <p className="text-gray-500 dark:text-gray-400">
              إجمالي المعلمين: <span className="font-semibold text-blue-600 dark:text-blue-400">{teachers.length}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 p-3 rounded-xl w-full pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
                isFilterOpen || hasActiveFilters
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FiFilter />
              الفلترة
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالاسم..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Email Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالبريد..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Phone Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الهاتف
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالهاتف..."
                  value={filters.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.active === undefined ? '' : String(filters.active)}
                  onChange={(e) => handleFilterChange('active', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">جميع الحالات</option>
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>

              {/* Order By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ترتيب حسب
                </label>
                <select
                  value={filters.orderBy}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => handleFilterChange('orderBy', e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="id">الرقم التسلسلي</option>
                  <option value="name">الاسم</option>
                  <option value="email">البريد الإلكتروني</option>
                </select>
              </div>

              {/* Order Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اتجاه الترتيب
                </label>
                <select

                  value={filters.orderByDirection}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => handleFilterChange('orderByDirection', e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="asc">تصاعدي (A-Z)</option>
                  <option value="desc">تنازلي (Z-A)</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                مسح الكل
              </button>
              <button
                onClick={applyFilters}
                className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                تطبيق الفلترة
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.name && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                الاسم: {filters.name}
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {filters.email && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                البريد: {filters.email}
                <button
                  onClick={() => handleFilterChange('email', '')}
                  className="ml-1 hover:text-green-600"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {filters.phone && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                الهاتف: {filters.phone}
                <button
                  onClick={() => handleFilterChange('phone', '')}
                  className="ml-1 hover:text-purple-600"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {filters.active !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                الحالة: {filters.active ? 'نشط' : 'غير نشط'}
                <button
                  onClick={() => handleFilterChange('active', undefined)}
                  className="ml-1 hover:text-orange-600"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full">
            <thead className="bg-blue-900">
              <tr>
                <th className="px-6 py-4 text-center text-white font-medium">الاسم</th>
                <th className="px-6 py-4 text-center text-white font-medium">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-center text-white font-medium">الهاتف</th>
                <th className="px-6 py-4 text-center text-white font-medium">نشط</th>
                <th className="px-6 py-4 text-center text-white font-medium">عرض التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-6">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500 dark:text-gray-400">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                teachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {teacher.phone}
                    </td>
                    <td className="px-6 py-4 text-center">

    <button
      onClick={() => toggleActive(teacher)}
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
        teacher.active ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
          teacher.active ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>

                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                        onClick={() => router.push(`/dashboard/pandding_Teachers/${teacher.id}`)}
                      >
                        <FiEye/> عرض
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-6">
          {/* <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            السابق
          </button>
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {currentPage} / {lastPage}
          </span>
          <button
            disabled={currentPage === lastPage}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            التالي
          </button> */}
        </div>
      </div>
    </Layout>
  )
}
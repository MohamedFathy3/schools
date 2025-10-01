// eslint-disable-next-line @typescript-eslint/no-explicit-any
'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FiSearch, FiEye, FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi'
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
  const [pageLoaded, setPageLoaded] = useState(false)

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
    // أنيميشن عند تحميل الصفحة
    setTimeout(() => setPageLoaded(true), 100)
  }, [])

  const toggleActive = async (teacher: Teacher) => {
    const newActiveState = !teacher.active
    
    // أنيميشن فوري للتغيير
    setTeachers(prev =>
      prev.map(t => 
        t.id === teacher.id 
          ? { ...t, active: newActiveState, animating: true } 
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
        // إظهار toast مع أنيميشن
        toast.success(
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              newActiveState 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-gray-500 animate-pulse'
            }`}>
              {newActiveState ? '✓' : '✗'}
            </div>
            <span className="font-medium">
              {newActiveState ? 'تم تفعيل الحساب بنجاح' : 'تم إلغاء تفعيل الحساب'}
            </span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: 'animate-bounceIn'
          }
        )
      } else {
        // التراجع عن التغيير في حالة الخطأ
        setTeachers(prev =>
          prev.map(t => 
            t.id === teacher.id 
              ? { ...t, active: teacher.active, animating: false } 
              : t
          )
        )
        toast.error(data.message || 'فشل في تعديل الحالة')
      }
    } catch (err) {
      console.error(err)
      // التراجع عن التغيير في حالة الخطأ
      setTeachers(prev =>
        prev.map(t => 
          t.id === teacher.id 
            ? { ...t, active: teacher.active, animating: false } 
            : t
        )
      )
      toast.error('حدث خطأ أثناء تعديل الحالة')
    }
  }

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

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.phone.includes(searchTerm)
  )

  return (
    <Layout>
      <div className={`p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen text-gray-900 dark:text-gray-100 transition-all duration-1000 ${
        pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="dark"
          toastClassName="rounded-xl animate-fadeInUp"
          progressClassName="bg-gradient-to-r from-blue-500 to-purple-500"
          bodyClassName="font-sans"
          closeButton={false}
        />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className={`transform transition-all duration-700 delay-300 ${
            pageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              قائمة المعلمين
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              إجمالي المعلمين: <span className="font-semibold text-blue-600 dark:text-blue-400 animate-pulse">{teachers.length}</span>
            </p>
          </div>
          
          <div className={`flex flex-col sm:flex-row gap-3 w-full lg:w-auto transition-all duration-700 delay-500 ${
            pageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            {/* Search */}
            <div className="relative flex-grow max-w-md transform transition-all duration-300 hover:scale-105">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 p-3 rounded-xl w-full pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                isFilterOpen || hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
              }`}
            >
              <FiFilter className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              الفلترة
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className={`transition-all duration-500 overflow-hidden ${
          isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 transform transition-all duration-500 ${
            isFilterOpen ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name Filter */}
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالاسم..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                />
              </div>

              {/* Email Filter */}
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالبريد..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                />
              </div>

              {/* Phone Filter */}
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الهاتف
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالهاتف..."
                  value={filters.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.active === undefined ? '' : String(filters.active)}
                  onChange={(e) => handleFilterChange('active', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                >
                  <option value="">جميع الحالات</option>
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>

              {/* Order By */}
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ترتيب حسب
                </label>
                <select
                  value={filters.orderBy}
                  onChange={(e) => handleFilterChange('orderBy', e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                >
                  <option value="id">الرقم التسلسلي</option>
                  <option value="name">الاسم</option>
                  <option value="email">البريد الإلكتروني</option>
                </select>
              </div>

              {/* Order Direction */}
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اتجاه الترتيب
                </label>
                <select
                  value={filters.orderByDirection}
                  onChange={(e) => handleFilterChange('orderByDirection', e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
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
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 transform hover:scale-105"
              >
                مسح الكل
              </button>
              <button
                onClick={applyFilters}
                className="ml-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                تطبيق الفلترة
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fadeIn">
            {filters.name && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 transition-all duration-300 transform hover:scale-105">
                الاسم: {filters.name}
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="ml-1 hover:text-blue-600 transition-colors duration-200"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {filters.email && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 transition-all duration-300 transform hover:scale-105">
                البريد: {filters.email}
                <button
                  onClick={() => handleFilterChange('email', '')}
                  className="ml-1 hover:text-green-600 transition-colors duration-200"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {filters.phone && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 transition-all duration-300 transform hover:scale-105">
                الهاتف: {filters.phone}
                <button
                  onClick={() => handleFilterChange('phone', '')}
                  className="ml-1 hover:text-purple-600 transition-colors duration-200"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
            {filters.active !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 transition-all duration-300 transform hover:scale-105">
                الحالة: {filters.active ? 'نشط' : 'غير نشط'}
                <button
                  onClick={() => handleFilterChange('active', undefined)}
                  className="ml-1 hover:text-orange-600 transition-colors duration-200"
                >
                  <FiX size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className={`overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-1000 delay-700 ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-blue-900 to-purple-900">
              <tr>
                <th className="px-6 py-4 text-center text-white font-medium transition-colors duration-300 hover:bg-blue-800">الاسم</th>
                <th className="px-6 py-4 text-center text-white font-medium transition-colors duration-300 hover:bg-blue-800">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-center text-white font-medium transition-colors duration-300 hover:bg-blue-800">الهاتف</th>
                <th className="px-6 py-4 text-center text-white font-medium transition-colors duration-300 hover:bg-blue-800">نشط</th>
                <th className="px-6 py-4 text-center text-white font-medium transition-colors duration-300 hover:bg-blue-800">عرض التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">جاري تحميل البيانات...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center animate-pulse">
                      <FiSearch className="text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد بيانات</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">جرب تغيير مصطلحات البحث أو الفلاتر</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => (
                  <tr 
                    key={teacher.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-500 ${
                      pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
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
                        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-all duration-500 focus:outline-none shadow-inner ${
                          teacher.active 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        } transform hover:scale-110 active:scale-95`}
                      >
                        <span
                          className={`inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-500 ${
                            teacher.active 
                              ? 'translate-x-6 ring-2 ring-green-200 animate-pulse' 
                              : 'translate-x-0 ring-2 ring-gray-200'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group"
                        onClick={() => router.push(`/dashboard/pandding_Teachers/${teacher.id}`)}
                      >
                        <FiEye className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"/> 
                        <span>عرض</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className={`flex justify-center gap-3 mt-8 transition-all duration-1000 delay-1000 ${
            pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <button
              disabled={currentPage === 1}
              onClick={() => fetchTeachers(currentPage - 1)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-md disabled:shadow-none"
            >
              السابق
            </button>
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
              {currentPage} / {lastPage}
            </span>
            <button
              disabled={currentPage === lastPage}
              onClick={() => fetchTeachers(currentPage + 1)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-md disabled:shadow-none"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Add custom animations to global CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes bounceIn {
          from, 20%, 40%, 60%, 80%, to {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
          }
          0% {
            opacity: 0;
            transform: scale3d(.3, .3, .3);
          }
          20% {
            transform: scale3d(1.1, 1.1, 1.1);
          }
          40% {
            transform: scale3d(.9, .9, .9);
          }
          60% {
            opacity: 1;
            transform: scale3d(1.03, 1.03, 1.03);
          }
          80% {
            transform: scale3d(.97, .97, .97);
          }
          to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out;
        }
        
        /* Toast custom styles */
        .Toastify__toast--success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }
        
        .Toastify__toast--error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        }
        
        .Toastify__progress-bar {
          height: 4px;
          border-radius: 2px;
        }
      `}</style>
    </Layout>
  )
}
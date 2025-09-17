'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { countryApi, Country } from '@/lib/api/countryApi'
import { FiEdit, FiRefreshCw, FiSearch, FiFlag, FiPlus, FiFilter } from 'react-icons/fi'
import { Switch } from '@/components/ui/Switch'
import { Pagination } from '@/components/ui/Pagination'
import toast from 'react-hot-toast'
import Layout from '@/components/Layout'
import Image from 'next/image'

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // استخدام debounce للبحث لتجنب طلبات API كثيرة
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  const loadCountries = useCallback(async () => {
    try {
      const filters = debouncedSearchTerm ? { name: debouncedSearchTerm } : {}
      const result = await countryApi.getCountries(currentPage, perPage, filters)
      
      if (result.success && result.data) {
        setCountries(result.data.data)
        setTotalPages(result.data.meta.last_page)
        setTotalItems(result.data.meta.total)
      } else {
        toast.error(result.message || 'فشل في تحميل البيانات')
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, debouncedSearchTerm])

  useEffect(() => {
    loadCountries()
  }, [loadCountries])

  const handleToggleActive = async (country: Country) => {
    try {
      setUpdatingId(country.id)
      
      // تحديث الواجهة فورياً أولاً
      setCountries(prev => prev.map(c => 
        c.id === country.id ? { ...c, active: !c.active } : c
      ))
      
      const result = await countryApi.toggleActive(country.id)
      
      if (result.success && result.data) {
        toast.success(`تم ${result.data.active ? 'تفعيل' : 'إلغاء تفعيل'} الدولة بنجاح`)
      } else {
        setCountries(prev => prev.map(c => 
          c.id === country.id ? { ...c, active: country.active } : c
        ))
        toast.error(result.message || 'فشل في تحديث الحالة')
      }
    } catch (error) {
      console.error('Error toggling country active status:', error)
      // في حالة حدوث خطأ، نرجع التغيير
      setCountries(prev => prev.map(c => 
        c.id === country.id ? { ...c, active: country.active } : c
      ))
      toast.error('حدث خطأ أثناء التحديث')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadCountries()
  }

  const handleRefresh = () => {
    setSearchTerm('')
    loadCountries()
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white py-8 transition-colors">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-white bg-clip-text text-transparent">
                إدارة الدول
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                إجمالي الدول: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{totalItems}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1 min-w-[250px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم الدولة أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full transition-all"
                  />
                  <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </form>

              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10 transition-all"
                  >
                    <option value="5">5 لكل صفحة</option>
                    <option value="10">10 لكل صفحة</option>
                    <option value="20">20 لكل صفحة</option>
                    <option value="50">50 لكل صفحة</option>
                  </select>
                  <FiFilter className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/20"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  <span>تحديث</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all border border-gray-100 dark:border-gray-700">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">العلم</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اسم الدولة</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الكود</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">المفتاح</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {countries.map((country) => (
                      <tr key={country.id} className="transition-colors text-center">
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-9 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
                            <Image
                              src={country.image || '/placeholder-flag.png'}
                              alt={`علم ${country.name}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-flag.png';
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{country.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {country.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono">+{country.key}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={country.active}
                              onCheckedChange={() => handleToggleActive(country)}
                              disabled={updatingId === country.id}
                            />
                            <span className={`text-sm font-medium ${country.active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {country.active ? 'مفعل' : 'غير مفعل'}
                            </span>
                            {updatingId === country.id && (
                              <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* {!loading && countries.length === 0 && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <FiFlag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">لا توجد دول لعرضها</p>
                <p className="mt-1 text-sm">لم يتم العثور على أي دول تطابق معايير البحث</p>
                {debouncedSearchTerm && (
                  <button 
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    عرض جميع الدول
                  </button>
                )}
              </div>
            )} */}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
      </Layout>
  )
}
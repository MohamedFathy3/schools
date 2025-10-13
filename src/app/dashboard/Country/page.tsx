'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { countryApi, Country } from '@/lib/api/countryApi'
import { FiRefreshCw, FiSearch, FiEye, FiEdit2, FiPlus, FiGlobe } from 'react-icons/fi'
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
      setLoading(true)
      const filters = debouncedSearchTerm ? { name: debouncedSearchTerm } : {}
      const result = await countryApi.getCountries(currentPage, perPage, filters)
      
      if (result.success && result.data) {
        setCountries(result.data.data)
        setTotalPages(result.data.meta.last_page)
        setTotalItems(result.data.meta.total)
      } else {
        toast.error(result.message || 'Failed to load data')
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      toast.error('Error loading data')
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
      
      setCountries(prev => prev.map(c => 
        c.id === country.id ? { ...c, active: !c.active } : c
      ))
      
      const result = await countryApi.toggleActive(country.id)
      
      if (result.success && result.data) {
        toast.success(`Country ${result.data.active ? 'activated' : 'deactivated'} successfully`)
      } else {
        setCountries(prev => prev.map(c => 
          c.id === country.id ? { ...c, active: country.active } : c
        ))
        toast.error(result.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error toggling country active status:', error)
      setCountries(prev => prev.map(c => 
        c.id === country.id ? { ...c, active: country.active } : c
      ))
      toast.error('Error updating status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRefresh = () => {
    setSearchTerm('')
    loadCountries()
  }

  const handleAddCountry = () => {
    toast.success('Add country form will open')
  }

  const handleEditCountry = (country: Country) => {
    toast.success(`Edit country: ${country.name}`)
  }

  const handleViewCountry = (country: Country) => {
    toast.success(`View country: ${country.name}`)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <FiGlobe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Countries Management</h1>
                  <p className="text-slate-600 mt-1">
                    Total countries: <span className="font-semibold text-blue-600">{totalItems}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full lg:w-80 pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                  </select>

                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

             
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Flag</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Country Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Phone Code</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {countries.map((country) => (
                        <tr 
                          key={country.id} 
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative w-12 h-9 rounded-lg border border-slate-200 overflow-hidden shadow-xs group-hover:shadow-sm transition-shadow">
                                <Image
                                  src={country.image || '/placeholder-flag.png'}
                                  alt={`${country.name} flag`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-flag.png';
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900">{country.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {country.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-slate-600">+{country.key}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={country.active}
                                onCheckedChange={() => handleToggleActive(country)}
                                disabled={updatingId === country.id}
                              />
                              <div className="flex flex-col">
                                <span className={`text-sm font-medium ${country.active ? 'text-green-600' : 'text-slate-500'}`}>
                                  {country.active ? 'Active' : 'Inactive'}
                                </span>
                                {updatingId === country.id && (
                                  <span className="text-xs text-slate-400">Updating...</span>
                                )}
                              </div>
                            </div>
                          </td>
                      
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {countries.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiGlobe className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No countries found</h3>
                    <p className="text-slate-500 mb-6">No countries match your search criteria</p>
                    {debouncedSearchTerm && (
                      <button 
                        onClick={handleRefresh}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Show all countries
                      </button>
                    )}
                  </div>
                )}
              </>
          </div>

          {/* Pagination & Footer */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
              </p>
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
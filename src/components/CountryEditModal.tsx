'use client'
import React, { useState } from 'react'
import { Country, countryApi } from '@/lib/api/countryApi'
import toast from 'react-hot-toast'

interface Props {
  country: Country | null
  onClose: () => void
  onUpdated: (updated: Country) => void
}

export default function CountryEditModal({ country, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<Partial<Country>>(country || {})
  const [loading, setLoading] = useState(false)

  if (!country) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await countryApi.updateCountry(country.id, form)
      if (result.success && result.data) {
        toast.success('تم تعديل الدولة بنجاح')
        onUpdated(result.data)
        onClose()
      } else {
        toast.error(result.message || 'فشل في تعديل الدولة')
      }
    } catch (err) {
      toast.error('خطأ أثناء التعديل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">تعديل الدولة</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">اسم الدولة</label>
            <input
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-1">الكود</label>
            <input
              name="code"
              value={form.code || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-1">المفتاح</label>
            <input
              name="key"
              value={form.key || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-1">رابط الصورة</label>
            <input
              name="image"
              value={form.image || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

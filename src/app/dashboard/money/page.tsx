'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'js-cookie'
import Layout from '@/components/Layout'
import { Switch } from '@headlessui/react'

interface Teacher {
  id: number
  name: string
  email: string
  phone?: string
  image: string | null
}

interface WithdrawRequest {
  id: number
  teacher: Teacher
  amount: string
  status: 'pending' | 'accepted' | 'rejected' | 'received'
  comment: string | null
  created_at: string
}

export default function AdminWithdrawRequestsPage() {
  const [requests, setRequests] = useState<WithdrawRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const API_URL = '/api'

  const getToken = () => Cookies.get('admin_token') || ''

  const fetchRequests = async () => {
    const token = getToken()
    if (!token) {
      window.location.href = '/admin/login'
      return
    }
    try {
      const res = await fetch(`${API_URL}/withdraw-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.data) setRequests(data.data)
    } catch (err) {
      console.error(err)
      toast.error('فشل في جلب الطلبات')
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(Number(amount))

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500'
      case 'approved': return 'text-green-500'
      case 'rejected': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة'
      case 'approved': return 'مقبول'
      case 'rejected': return 'مرفوض'
      default: return status
    }
  }

  const handleStatusChange = async (req: WithdrawRequest, newStatus: 'accepted' | 'rejected') => {
    const token = getToken()
    if (!token) {
      window.location.href = '/admin/login'
      return
    }
    try {
      const res = await fetch(`${API_URL}/withdraw-request/${req.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.result === 'Success') {
        toast.success('تم تغيير حالة الطلب بنجاح')
        fetchRequests()
        if (selectedRequest?.id === req.id) setSelectedRequest({ ...req, status: newStatus })
      } else {
        toast.error(data.message || 'فشل في تغيير الحالة')
      }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء التحديث')
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">طلبات السحب - الادمن</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center">لا توجد طلبات سحب</p>
          ) : (
            requests.map(req => (
              <div
                key={req.id}
                className="bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition relative"
                onClick={() => { setSelectedRequest(req); setShowModal(true) }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img src={req.teacher.image || '/default-avatar.png'} alt="teacher" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h2 className="font-semibold text-lg">{req.teacher.name}</h2>
                    <p className="text-gray-400 text-sm">{req.teacher.email}</p>
                  </div>
                </div>

                <p className="mb-2"><strong>المبلغ:</strong> {formatCurrency(req.amount)}</p>
                <p className={`mb-2 font-semibold ${getStatusColor(req.status)}`}><strong>الحالة:</strong> {getStatusText(req.status)}</p>
                <p className="text-gray-400 text-sm mb-4">{formatDate(req.created_at)}</p>

             {req.status !== 'accepted' &&  req.status !=='rejected' && (
  <div className="flex justify-between">
    <button
      onClick={e => {
        e.stopPropagation()
        handleStatusChange(req, 'accepted')
      }}
      className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white"
    >
      قبول
    </button>
    <button
      onClick={e => {
        e.stopPropagation()
        handleStatusChange(req, 'rejected')
      }}
      className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white"
    >
      رفض
    </button>
  </div>
)}

              </div>
            ))
          )}
        </div>

        {/* Modal لتفاصيل الطلب */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-11/12 md:w-1/2 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">تفاصيل الطلب</h2>
              <p><strong>المعلم:</strong> {selectedRequest.teacher.name}</p>
              <p><strong>البريد الإلكتروني:</strong> {selectedRequest.teacher.email}</p>
              <p><strong>الهاتف:</strong> {selectedRequest.teacher.phone || '-'}</p>
              <p><strong>المبلغ:</strong> {formatCurrency(selectedRequest.amount)}</p>
              <p><strong>الحالة:</strong> <span className={getStatusColor(selectedRequest.status)}>{getStatusText(selectedRequest.status)}</span></p>
              <p><strong>ملاحظات:</strong> {selectedRequest.comment || '-'}</p>
              <p><strong>تاريخ الطلب:</strong> {formatDate(selectedRequest.created_at)}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

'use client'
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import Cookies from 'js-cookie'
import Layout from '@/components/Layout'
import { FiEye, FiCheck, FiX, FiCalendar, FiMail, FiPhone, FiDollarSign } from 'react-icons/fi'

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
      toast.error('Failed to fetch requests')
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(Number(amount))

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Rejected'
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
        toast.success('Request status updated successfully')
        fetchRequests()
        if (selectedRequest?.id === req.id) setSelectedRequest({ ...req, status: newStatus })
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error updating request')
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Requests</h1>
          <p className="text-gray-600">Manage teacher withdrawal requests</p>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <FiDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No withdrawal requests found</p>
              </div>
            </div>
          ) : (
            requests.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setSelectedRequest(req); setShowModal(true) }}
              >
                <div className="p-6">
                  {/* Teacher Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={req.teacher.image || '/default-avatar.png'} 
                      alt="teacher" 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{req.teacher.name}</h3>
                      <p className="text-gray-500 text-sm truncate">{req.teacher.email}</p>
                    </div>
                  </div>

                  {/* Amount and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(req.amount)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                      {getStatusText(req.status)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(req.created_at)}
                  </div>

                  {/* Action Buttons */}
                  {req.status !== 'accepted' && req.status !== 'rejected' && (
                    <div className="flex gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleStatusChange(req, 'accepted')
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleStatusChange(req, 'rejected')
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Request Details Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Teacher Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Teacher Information</h3>
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedRequest.teacher.image || '/default-avatar.png'} 
                      alt="teacher" 
                      className="w-16 h-16 rounded-full object-cover border border-gray-200" 
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedRequest.teacher.name}</p>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <FiMail className="w-4 h-4" />
                        {selectedRequest.teacher.email}
                      </div>
                      {selectedRequest.teacher.phone && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <FiPhone className="w-4 h-4" />
                          {selectedRequest.teacher.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Amount</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedRequest.amount)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Request Date</h4>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(selectedRequest.created_at)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Comments</h4>
                    <p className="text-gray-900">
                      {selectedRequest.comment || 'No comments provided'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRequest.status !== 'accepted' && selectedRequest.status !== 'rejected' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(selectedRequest, 'accepted')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                      <FiCheck className="w-5 h-5" />
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                      <FiX className="w-5 h-5" />
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
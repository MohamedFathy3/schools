'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FiArrowLeft, FiMail, FiPhone, FiCreditCard, FiUser, 
  FiDollarSign, FiBook, FiAward, FiFlag, FiUsers, 
  FiStar, FiCalendar, FiGift, FiEdit3, FiAtSign
} from 'react-icons/fi'
import Layout from '@/components/Layout'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'

interface Teacher {
  id: number
  name: string
  email: string
  secound_email: string | null
  phone: string
  national_id: string
  image: string
  certificate_image: string
  experience_image: string
  account_holder_name: string
  account_number: string
  iban: string
  swift_code: string
  branch_name: string
  wallets_name: string
  wallets_number: string
  commission?: string
  rewards?: string
  country: { id: number; name: string; image: string; code: string }
  stage: { id: number; name: string; postion: number; image: string }
  subject: { id: number; name: string; postion: number; image: string }
  courses_count: number
  students_count: number
  total_income: number
  average_rating: number
}

const API_URL = '/api'

// Helper function to display data or N/A
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const displayData = (data: any, suffix: string = '') => {
  if (!data || data === 'null' || data === 'undefined' || data === '' || data === null) {
    return 'N/A'
  }
  return `${data}${suffix}`
}

export default function TeacherDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [commission, setCommission] = useState<number>(0)
  const [reward, setReward] = useState<number>(0)
  const [secondEmail, setSecondEmail] = useState<string>('')
  const [isEditingCommission, setIsEditingCommission] = useState(false)
  const [isEditingReward, setIsEditingReward] = useState(false)
  const [isEditingSecondEmail, setIsEditingSecondEmail] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`${API_URL}/teacher/${id}`)
        const data = await res.json()
        if (data.status === 200) {
          setTeacher(data.data)
          const comm = parseFloat(data.data.commission?.replace('%','')) || 0
          const rew = parseFloat(data.data.rewards) || 0
          setCommission(comm)
          setReward(rew)
          setSecondEmail(data.data.secound_email || '')
        }
      } catch (err) {
        console.error('Error fetching teacher:', err)
        toast.error('Failed to load teacher data')
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])

  const handleUpdateCommission = async () => {
    if (!teacher) return
    try {
      const token = Cookies.get('admin_token') || ''
      const res = await fetch(`${API_URL}/teachers/${teacher.id}/commission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          commission: commission,
          secound_email: secondEmail,
          reward: reward
        }),
      })
      const data = await res.json()
      if (data.result === 'Success') {
        toast.success('Commission updated successfully!')
        setTeacher({ ...teacher, commission: `${commission.toFixed(2)}%` })
        setIsEditingCommission(false)
      } else {
        toast.error(data.message || 'Failed to update commission')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error updating commission')
    }
  }

  const handleUpdateReward = async () => {
    if (!teacher) return
    try {
      const token = Cookies.get('admin_token') || ''
      const res = await fetch(`${API_URL}/teachers/${teacher.id}/commission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          reward: reward,
          commission: commission,
          secound_email: secondEmail
        }),
      })
      const data = await res.json()
      if (data.result === 'Success') {
        toast.success('Reward updated successfully!')
        setTeacher({ ...teacher, rewards: reward.toString() })
        setIsEditingReward(false)
      } else {
        toast.error(data.message || 'Failed to update reward')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error updating reward')
    }
  }

  const handleUpdateSecondEmail = async () => {
    if (!teacher) return
    try {
      const token = Cookies.get('admin_token') || ''
      const res = await fetch(`${API_URL}/teachers/${teacher.id}/commission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          secound_email: secondEmail,
          commission: commission,
          reward: reward
        }),
      })
      const data = await res.json()
      if (data.result === 'Success') {
        toast.success('Second email updated successfully!')
        setTeacher({ ...teacher, secound_email: secondEmail })
        setIsEditingSecondEmail(false)
      } else {
        toast.error(data.message || 'Failed to update second email')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error updating second email')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading teacher information...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!teacher) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Teacher Not Found</h2>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-lg border-b">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-semibold"
              >
                <FiArrowLeft className="ml-2" />
                Back to Teachers List
              </button>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Teacher Profile
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{teacher.courses_count}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiBook className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{teacher.students_count}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiUsers className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {teacher.total_income.toLocaleString()} EGP
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FiDollarSign className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{teacher.average_rating}/5</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FiStar className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Commission, Reward and Second Email Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Commission Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FiDollarSign className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Commission Rate</h3>
                    <p className="text-gray-600 text-sm">Current commission percentage</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingCommission(!isEditingCommission)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
                >
                  <FiEdit3 className="w-5 h-5" />
                </button>
              </div>

              {isEditingCommission ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={commission}
                      onChange={e => setCommission(Number(e.target.value))}
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                      placeholder="Enter commission percentage"
                    />
                    <span className="text-gray-600 font-medium">%</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditingCommission(false)}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateCommission}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayData(teacher.commission)}
                    </p>
                    <p className="text-gray-600 mt-1 text-sm">Commission rate</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reward Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FiGift className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Teacher Reward</h3>
                    <p className="text-gray-600 text-sm">Bonus reward amount</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingReward(!isEditingReward)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors hover:bg-green-50 rounded-lg"
                >
                  <FiEdit3 className="w-5 h-5" />
                </button>
              </div>

              {isEditingReward ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min={0}
                      value={reward}
                      onChange={e => setReward(Number(e.target.value))}
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                      placeholder="Enter reward amount"
                    />
                    <span className="text-gray-600 font-medium">EGP</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditingReward(false)}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateReward}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayData(teacher.rewards, ' EGP')}
                    </p>
                    <p className="text-gray-600 mt-1 text-sm">Reward amount</p>
                  </div>
                </div>
              )}
            </div>

            {/* Second Email Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FiAtSign className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Second Email</h3>
                    <p className="text-gray-600 text-sm">Additional email address</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingSecondEmail(!isEditingSecondEmail)}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-lg"
                >
                  <FiEdit3 className="w-5 h-5" />
                </button>
              </div>

              {isEditingSecondEmail ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="email"
                      value={secondEmail}
                      onChange={e => setSecondEmail(e.target.value)}
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                      placeholder="Enter second email"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditingSecondEmail(false)}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateSecondEmail}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900 break-all">
                      {displayData(teacher.secound_email)}
                    </p>
                    <p className="text-gray-600 mt-1 text-sm">Secondary contact email</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Teacher Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
                <div className="text-center mb-6">
                  <img
                    src={displayData(teacher.image) !== 'N/A' ? teacher.image : '/default-avatar.png'}
                    alt={teacher.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-100 shadow-lg"
                  />
                  <h2 className="text-2xl font-bold text-gray-900 mt-4">{displayData(teacher.name)}</h2>
                  <p className="text-gray-600 mt-2">Professional Teacher</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiMail className="text-blue-500 ml-3" />
                    <div>
                      <p className="text-sm text-gray-600">Primary Email</p>
                      <p className="text-gray-900 font-medium break-all">{displayData(teacher.email)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiPhone className="text-green-500 ml-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.phone)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiUser className="text-purple-500 ml-3" />
                    <div>
                      <p className="text-sm text-gray-600">National ID</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.national_id)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiFlag className="text-red-500 ml-3" />
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <div className="flex items-center mt-1">
                        {displayData(teacher.country?.image) !== 'N/A' && (
                          <img 
                            src={teacher.country.image} 
                            alt={teacher.country.name} 
                            className="w-6 h-6 rounded-full ml-2" 
                          />
                        )}
                        <span className="text-gray-900 font-medium">{displayData(teacher.country?.name)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Sections */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBook className="ml-2 text-blue-500" />
                    Academic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-600">Stage:</span>
                      <span className="text-gray-900 font-medium">{displayData(teacher.stage?.name)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-600">Subject:</span>
                      <span className="text-gray-900 font-medium">{displayData(teacher.subject?.name)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-600">Subject Position:</span>
                      <span className="text-gray-900 font-medium">{displayData(teacher.subject?.postion)}</span>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiCreditCard className="ml-2 text-green-500" />
                    Banking Information
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Account Holder</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.account_holder_name)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.account_number)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">IBAN</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.iban)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Branch Name</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.branch_name)}</p>
                    </div>
                  </div>
                </div>

                {/* E-Wallets */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiDollarSign className="ml-2 text-yellow-500" />
                    E-Wallets
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Wallet Type</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.wallets_name)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Wallet Number</p>
                      <p className="text-gray-900 font-medium">{displayData(teacher.wallets_number)}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiAward className="ml-2 text-purple-500" />
                    Documents
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Certificate Image</p>
                      {displayData(teacher.certificate_image) !== 'N/A' ? (
                        <a href={teacher.certificate_image} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={teacher.certificate_image} 
                            alt="Certificate" 
                            className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity border-2 border-gray-200 hover:border-blue-500" 
                          />
                        </a>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 border-dashed">
                          <span className="text-gray-500">No certificate image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Experience Image</p>
                      {displayData(teacher.experience_image) !== 'N/A' ? (
                        <a href={teacher.experience_image} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={teacher.experience_image} 
                            alt="Experience" 
                            className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity border-2 border-gray-200 hover:border-green-500" 
                          />
                        </a>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 border-dashed">
                          <span className="text-gray-500">No experience image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
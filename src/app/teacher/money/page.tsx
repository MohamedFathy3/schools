'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiDollarSign, FiFileText, FiSend, FiCheckCircle, FiUsers, FiBook, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'js-cookie'

import Layoutteacher from '@/components/Layoutteacher'
import { useTeacherAuth } from '@/contexts/teacherAuthContext'

interface WithdrawRequest {
  amount: number
  note: string
}

interface TeacherBalance {
  available: number
  pending: number
  total: number
  courses_count: number
  students_count: number
}

interface WithdrawItem {
  id: number
  amount: string
  status: string
  comment: string | null
  created_at: string
  teacher: {
    id: number
    name: string
    email: string
  }
}

export default function WithdrawPage() {
  const [formData, setFormData] = useState<WithdrawRequest>({
    amount: 0,
    note: ''
  })
  const [amountInput, setAmountInput] = useState('') // حالة منفصلة للـ input كنص
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentRequests, setRecentRequests] = useState<WithdrawItem[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const router = useRouter()
  const { user, loading: userLoading } = useTeacherAuth()
  const API_URL = '/api'

  // استخدام بيانات المستخدم من الـ context بشكل آمن
  const balance: TeacherBalance = {
    available: (user as any)?.total_income || 0,
    pending: 0,
    total: (user as any)?.total_income || 0,
    courses_count: (user as any)?.courses_count || 0,
    students_count: (user as any)?.students_count || 0
  }

  // جلب التوكن
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return Cookies.get('teacher_token')
    }
    return null
  }

  // جلب طلبات السحب الحديثة من /withdraw-my
  const fetchRecentRequests = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      setIsLoadingRequests(true)
      const res = await fetch(`${API_URL}/withdraw-my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await res.json()
      console.log('Withdraw requests data:', data)
      
      if (data.status === 200 && data.data) {
        setRecentRequests(data.data)
      } else if (data.data) {
        setRecentRequests(data.data)
      } else {
        toast.error(data.message || 'فشل في تحميل طلبات السحب')
      }
    } catch (error) {
      console.error('Error fetching recent requests:', error)
      toast.error('حدث خطأ في تحميل طلبات السحب')
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRecentRequests()
    }
  }, [user])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // السماح بإدخال الأرقام والنقاط فقط
    if (/^\d*\.?\d*$/.test(value)) {
      setAmountInput(value)
      
      // تحويل القيمة إلى رقم وتحديث formData
      const numericValue = parseFloat(value) || 0
      setFormData(prev => ({
        ...prev,
        amount: numericValue
      }))
    }
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      note: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push('/teacher/login')
      return
    }

    // التحقق من صحة البيانات
    if (formData.amount <= 0) {
      toast.error('المبلغ يجب أن يكون أكبر من الصفر')
      return
    }

    if (formData.amount > balance.available) {
      toast.error('المبلغ المطلوب أكبر من الرصيد المتاح')
      return
    }

    if (!formData.note.trim()) {
      toast.error('يرجى إضافة ملاحظة لطلب السحب')
      return
    }

    // التحقق من الحد الأدنى للسحب (50 جنيه)
    if (formData.amount < 10) {
      toast.error('الحد الأدنى للسحب هو 50   ')
      return
    }

    setIsSubmitting(true)

    try {
      const token = getToken()
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const res = await fetch(`${API_URL}/withdraw-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: formData.amount,
          note: formData.note
        })
      })

      const data = await res.json()
      console.log('Withdraw response:', data)
      
      if (data.status === 200 || data.success) {
        toast.success('تم إرسال طلب السحب بنجاح!')
        setFormData({ amount: 0, note: '' })
        setAmountInput('') // إعادة تعيين حقل الإدخال
        fetchRecentRequests()
      } else {
        toast.error(data.message || 'فشل في إرسال طلب السحب')
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إرسال طلب السحب')
      console.error('Error submitting withdraw request:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500 text-yellow-900'
      case 'approved': return 'bg-green-500 text-green-900'
      case 'rejected': return 'bg-red-500 text-red-900'
      case 'completed': return 'bg-blue-500 text-blue-900'
      default: return 'bg-gray-500 text-gray-900'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'قيد المراجعة'
      case 'approved': return 'مقبول'
      case 'rejected': return 'مرفوض'
      case 'completed': return 'مكتمل'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <FiClock className="ml-2" />
      case 'approved': return <FiCheckCircle className="ml-2" />
      case 'rejected': return <FiAlertCircle className="ml-2" />
      case 'completed': return <FiCheckCircle className="ml-2" />
      default: return <FiClock className="ml-2" />
    }
  }

  if (userLoading) {
    return (
      <Layoutteacher>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layoutteacher>
    )
  }

  if (!user) {
    return (
      <Layoutteacher>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg">يجب تسجيل الدخول أولاً</p>
            <button 
              onClick={() => router.push('/teacher/login')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </Layoutteacher>
    )
  }

  return (
    <Layoutteacher>
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
        <ToastContainer />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg mr-3 md:mr-4"
              >
                <FiArrowLeft className="text-lg md:text-xl" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold">طلب سحب الأموال</h1>
            </div>
            <div className="text-sm text-gray-400">
              مرحباً، {user.name}
            </div>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">الرصيد المتاح</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                    {formatCurrency(balance.available)}
                  </p>
                </div>
                <FiDollarSign className="text-2xl md:text-3xl text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">عدد الكورسات</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                    {balance.courses_count}
                  </p>
                </div>
                <FiBook className="text-2xl md:text-3xl text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">عدد الطلاب</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                    {balance.students_count}
                  </p>
                </div>
                <FiUsers className="text-2xl md:text-3xl text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm">إجمالي الأرباح</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                    {formatCurrency(balance.total)}
                  </p>
                </div>
                <FiCheckCircle className="text-2xl md:text-3xl text-orange-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* نموذج طلب السحب */}
            <div className="bg-gray-800 rounded-2xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">طلب سحب جديد</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">المبلغ المطلوب *</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" // تغيير إلى text بدلاً من number
                      name="amount"
                      value={amountInput}
                      onChange={handleAmountChange}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل المبلغ المطلوب (مثال: 150.50)"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    الحد الأدنى: 50 جنيه | الحد الأقصى: {formatCurrency(balance.available)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">ملاحظات *</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleNoteChange}
                    required
                    rows={3}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="عايز اسحب ١ جنيه..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || balance.total_income < 30}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <FiSend className="ml-2" />
                      إرسال طلب السحب
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* طلبات السحب الحديثة */}
            <div className="bg-gray-800 rounded-2xl p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold">طلبات السحب السابقة</h2>
                <button 
                  onClick={fetchRecentRequests}
                  disabled={isLoadingRequests}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center disabled:opacity-50"
                >
                  <FiRefreshCw className={`ml-1 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                  تحديث
                </button>
              </div>
              
              {isLoadingRequests ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">جاري تحميل الطلبات...</p>
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiFileText className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات سحب سابقة</p>
                  <p className="text-sm mt-2">سيظهر هنا تاريخ طلبات السحب بعد إرسال أول طلب</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="bg-gray-700 rounded-lg p-3 md:p-4 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-base md:text-lg">
                          {formatCurrency(parseFloat(request.amount))}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)} flex items-center`}>
                          {getStatusText(request.status)}
                          {getStatusIcon(request.status)}
                        </span>
                      </div>
                      {request.comment && (
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                          <span className="font-medium">ملاحظة:</span> {request.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* معلومات الحساب البنكي */}
          {(user as any)?.account_holder_name && (
            <div className="bg-gray-800 rounded-2xl p-4 md:p-6 mt-6 md:mt-8">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">معلومات الحساب البنكي المسجل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">اسم صاحب الحساب:</p>
                  <p className="text-white font-medium">{(user as any)?.account_holder_name}</p>
                </div>
                {(user as any)?.account_number && (
                  <div>
                    <p className="text-gray-400">رقم الحساب:</p>
                    <p className="text-white font-medium">{(user as any)?.account_number}</p>
                  </div>
                )}
                {(user as any)?.iban && (
                  <div>
                    <p className="text-gray-400">IBAN:</p>
                    <p className="text-white font-medium">{(user as any)?.iban}</p>
                  </div>
                )}
                {(user as any)?.wallets_number && (
                  <div>
                    <p className="text-gray-400">رقم المحفظة:</p>
                    <p className="text-white font-medium">{(user as any)?.wallets_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-gray-800 rounded-2xl p-4 md:p-6 mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">معلومات مهمة حول السحب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm text-gray-300">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>الحد الأدنى للسحب هو 50 جنيه مصري</span>
                </div>
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>يتم معالجة الطلبات خلال 3-5 أيام عمل</span>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>عمولة النظام: {(user as any)?.commission || '20.00%'}</span>
                </div>
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>للاستفسارات، يرجى التواصل مع الدعم الفني</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layoutteacher>
  )
}
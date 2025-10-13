'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiDollarSign, FiFileText, FiSend, FiCheckCircle, FiUsers, FiBook, FiClock, FiAlertCircle, FiRefreshCw, FiCreditCard, FiSmartphone, FiMail } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import Cookies from 'js-cookie'
import Layoutteacher from '@/components/Layoutteacher'

interface WithdrawRequest {
  amount: number
  note: string
  transfer_type: 'bank' | 'wallet' | 'postal'
}

interface TeacherData {
  id: number
  name: string
  email: string
  commission: string
  courses_count: number
  students_count: number
  total_income: number
  account_holder_name?: string
  account_number?: string
  iban?: string
  wallets_number?: string
}

interface TeacherBalance {
  total_income: number
  net_income: number
  commission_amount: number
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
    note: '',
    transfer_type: 'bank'
  })
  const [amountInput, setAmountInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentRequests, setRecentRequests] = useState<WithdrawItem[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const API_URL = '/api'

  // حساب صافي الربح والعمولة
  const calculateNetIncome = (teacher: TeacherData): TeacherBalance => {
    const totalIncome = teacher.total_income || 0
    const commissionRate = parseFloat(teacher.commission) / 100
    const commissionAmount = totalIncome * commissionRate
    const netIncome = totalIncome - commissionAmount

    return {
      total_income: totalIncome,
      net_income: netIncome,
      commission_amount: commissionAmount,
      courses_count: teacher.courses_count || 0,
      students_count: teacher.students_count || 0
    }
  }

  const balance = teacherData ? calculateNetIncome(teacherData) : {
    total_income: 0,
    net_income: 0,
    commission_amount: 0,
    courses_count: 0,
    students_count: 0
  }

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return Cookies.get('teacher_token')
    }
    return null
  }

  // جلب بيانات المعلم من API
  const fetchTeacherData = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        router.push('/teacher/login')
        return
      }

      setLoading(true)
      const res = await fetch(`${API_URL}/teachers/check-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await res.json()
      
      if (data.result === 'Success' && data.message?.teacher) {
        setTeacherData(data.message.teacher)
      } else {
        toast.error('فشل في تحميل بيانات المعلم')
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentRequests = async () => {
    try {
      const token = getToken()
      if (!token) {
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
      console.log('Withdraw requests response:', data)
      
      // معالجة مختلف أشكال الرد
      if (data.status === 200 && data.data) {
        setRecentRequests(data.data)
      } else if (data.data && Array.isArray(data.data)) {
        setRecentRequests(data.data)
      } else if (data.withdraw_requests) {
        setRecentRequests(data.withdraw_requests)
      } else if (data.requests) {
        setRecentRequests(data.requests)
      } else {
        console.log('No withdraw requests data found:', data)
        setRecentRequests([])
        // لا تعرض رسالة خطأ إذا كانت البيانات فارغة
      }
    } catch (error) {
      console.error('Error fetching recent requests:', error)
      // لا تعرض toast error هنا علشان ميظهرش رسالة حمراء لما مفيش بيانات
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchTeacherData()
  }, [])

  useEffect(() => {
    if (teacherData) {
      fetchRecentRequests()
    }
  }, [teacherData])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    if (/^\d*\.?\d*$/.test(value)) {
      setAmountInput(value)
      
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

  const handleTransferTypeChange = (type: 'bank' | 'wallet' | 'postal') => {
    setFormData(prev => ({
      ...prev,
      transfer_type: type
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!teacherData) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push('/teacher/login')
      return
    }

    if (formData.amount <= 0) {
      toast.error('المبلغ يجب أن يكون أكبر من الصفر')
      return
    }

    if (formData.amount > balance.net_income) {
      toast.error('المبلغ المطلوب أكبر من الرصيد المتاح')
      return
    }

    if (!formData.note.trim()) {
      toast.error('يرجى إضافة ملاحظة لطلب السحب')
      return
    }

    if (formData.amount < 50) {
      toast.error('الحد الأدنى للسحب هو 50 جنيه')
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
          note: formData.note,
          transfer_type: formData.transfer_type
        })
      })

      const data = await res.json()
      console.log('Withdraw response:', data)
      
      if (data.result === "Success" || data.status === 200 || data.success) {
        toast.success(data.message || 'تم إرسال طلب السحب بنجاح!')
        
        // إضافة الطلب الجديد يدويًا للقائمة
        const newRequest: WithdrawItem = {
          id: data.data?.id || Date.now(),
          amount: formData.amount.toString(),
          status: 'pending',
          comment: formData.note,
          created_at: new Date().toISOString(),
          teacher: {
            id: teacherData.id,
            name: teacherData.name,
            email: teacherData.email
          }
        }
        
        setRecentRequests(prev => [newRequest, ...prev])
        setFormData({ amount: 0, note: '', transfer_type: 'bank' })
        setAmountInput('')
        
        // تحديث بيانات المعلم
        await fetchTeacherData()
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
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

  const getTransferTypeIcon = (type: string) => {
    switch (type) {
      case 'bank': return <FiCreditCard className="ml-2" />
      case 'wallet': return <FiSmartphone className="ml-2" />
      case 'postal': return <FiMail className="ml-2" />
      default: return <FiCreditCard className="ml-2" />
    }
  }

  const getTransferTypeText = (type: string) => {
    switch (type) {
      case 'bank': return 'تحويل بنكي'
      case 'wallet': return 'محفظة إلكترونية'
      case 'postal': return 'حوالة بريدية'
      default: return type
    }
  }

  if (loading) {
    return (
      <Layoutteacher>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layoutteacher>
    )
  }

  if (!teacherData) {
    return (
      <Layoutteacher>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-800 text-lg">يجب تسجيل الدخول أولاً</p>
            <button 
              onClick={() => router.push('/teacher/login')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
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
      <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-6">
        <ToastContainer 
          position="top-left"
          autoClose={3000}
          rtl={true}
          theme="light"
        />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg mr-3 md:mr-4 border border-gray-200 transition-colors"
              >
                <FiArrowLeft className="text-lg md:text-xl" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">طلب سحب الأموال</h1>
                <p className="text-gray-600 mt-1">إدارة أرباحك وطلبات السحب</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
              مرحباً، {teacherData.name}
            </div>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">صافي الربح المتاح</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2 text-green-600">
                    {formatCurrency(balance.net_income)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">بعد خصم العمولة</p>
                </div>
                <FiDollarSign className="text-2xl md:text-3xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي الأرباح</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2 text-blue-600">
                    {formatCurrency(balance.total_income)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">قبل الخصم</p>
                </div>
                <FiCheckCircle className="text-2xl md:text-3xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">العمولة</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2 text-orange-600">
                    {formatCurrency(balance.commission_amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">نسبة {teacherData.commission}</p>
                </div>
                <FiUsers className="text-2xl md:text-3xl text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">عدد الكورسات</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2 text-purple-600">
                    {balance.courses_count}
                  </p>
                </div>
                <FiBook className="text-2xl md:text-3xl text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* نموذج طلب السحب */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">طلب سحب جديد</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* طريقة السحب */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">طريقة السحب *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'bank' as const, icon: FiCreditCard, text: 'بنكي', color: 'blue' },
                      { type: 'wallet' as const, icon: FiSmartphone, text: 'محفظة', color: 'green' },
                      { type: 'postal' as const, icon: FiMail, text: 'بريدي', color: 'purple' }
                    ].map(({ type, icon: Icon, text, color }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTransferTypeChange(type)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                          formData.transfer_type === type 
                            ? `border-${color}-500 bg-${color}-50 text-${color}-700` 
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="text-lg mb-1" />
                        <span className="text-xs font-medium">{text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">المبلغ المطلوب *</label>
                  <div className="relative">
                    <FiDollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="amount"
                      value={amountInput}
                      onChange={handleAmountChange}
                      required
                      className="w-full pr-10 pl-3 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل المبلغ المطلوب (مثال: 150.50)"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    الحد الأدنى: 50 جنيه | المتاح: {formatCurrency(balance.net_income)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">ملاحظات *</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleNoteChange}
                    required
                    rows={3}
                    className="w-full p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="اكتب ملاحظاتك حول طلب السحب..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || balance.net_income < 50}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
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
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">طلبات السحب السابقة</h2>
                <button 
                  onClick={fetchRecentRequests}
                  disabled={isLoadingRequests}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center disabled:opacity-50 transition-colors"
                >
                  <FiRefreshCw className={`ml-1 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                  تحديث
                </button>
              </div>
              
              {isLoadingRequests ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري تحميل الطلبات...</p>
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiFileText className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات سحب سابقة</p>
                  <p className="text-sm mt-2">سيظهر هنا تاريخ طلبات السحب بعد إرسال أول طلب</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-semibold text-lg text-gray-800">
                            {formatCurrency(parseFloat(request.amount))}
                          </span>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            {getTransferTypeIcon(formData.transfer_type)}
                            <span className="mr-1">{getTransferTypeText(formData.transfer_type)}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(request.status)} flex items-center font-medium`}>
                          {getStatusText(request.status)}
                          {getStatusIcon(request.status)}
                        </span>
                      </div>
                      {request.comment && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          <span className="font-medium">ملاحظة:</span> {request.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* معلومات الحساب البنكي */}
          {teacherData.account_holder_name && (
            <div className="bg-white rounded-2xl p-4 md:p-6 mt-6 md:mt-8 border border-gray-200 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">معلومات الحساب البنكي المسجل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">اسم صاحب الحساب:</p>
                  <p className="text-gray-800 font-medium">{teacherData.account_holder_name}</p>
                </div>
                {teacherData.account_number && (
                  <div>
                    <p className="text-gray-600">رقم الحساب:</p>
                    <p className="text-gray-800 font-medium">{teacherData.account_number}</p>
                  </div>
                )}
                {teacherData.iban && (
                  <div>
                    <p className="text-gray-600">IBAN:</p>
                    <p className="text-gray-800 font-medium">{teacherData.iban}</p>
                  </div>
                )}
                {teacherData.wallets_number && (
                  <div>
                    <p className="text-gray-600">رقم المحفظة:</p>
                    <p className="text-gray-800 font-medium">{teacherData.wallets_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-white rounded-2xl p-4 md:p-6 mt-6 md:mt-8 border border-gray-200 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">معلومات مهمة حول السحب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm text-gray-600">
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
                  <span>عمولة النظام: {teacherData.commission}</span>
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
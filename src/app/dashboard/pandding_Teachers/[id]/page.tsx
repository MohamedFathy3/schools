'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FiArrowLeft, FiMail, FiPhone, FiCreditCard, FiUser, 
  FiDollarSign, FiBook, FiAward, FiFlag, FiUsers, 
  FiStar, FiCalendar, FiDollarSign as DollarIcon 
} from 'react-icons/fi'
import Layout from '@/components/Layout'

interface Teacher {
  id: number
  name: string
  email: string
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
  country: {
    id: number
    name: string
    image: string
    code: string
  }
  stage: {
    id: number
    name: string
    postion: number
    image: string
  }
  subject: {
    id: number
    name: string
    postion: number
    image: string
  }
}

// إحصائيات وهمية للمعلم (يمكن استبدالها ببيانات من API)
const teacherStats = {
  totalStudents: 245,
  totalCourses: 12,
  rating: 4.8,
  completedSessions: 156,
  earnings: 12500
}
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function TeacherDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`${API_URL}/teacher/${id}`)
        const data = await res.json()
        
        if (data.status === 200) {
          setTeacher(data.data)
        } else {
          console.error('Failed to fetch teacher:', data.message)
        }
      } catch (err) {
        console.error('Error fetching teacher:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [id])

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-900">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900 opacity-70 backdrop-blur-sm"></div>

        {/* Top loading bar */}
        <div className="absolute top-0 left-0 h-1 w-full bg-blue-900 overflow-hidden">
          <div
            className="h-1 bg-blue-500 animate-loading-bar"
            style={{ width: '50%' }}
          />
        </div>

        {/* Center Spinner Placeholder */}
        <div className="relative flex items-center justify-center min-h-screen">
          {/* ممكن تحط spinner هنا */}
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">لم يتم العثور على المدرس</h2>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            العودة
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FiArrowLeft className="ml-2" />
                العودة للقائمة
              </button>
              <h1 className="text-2xl font-bold">تفاصيل المعلم</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* إحصائيات */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  {/* الطلاب */}
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xl">إجمالي الطلاب</p>
        <p className="text-2xl font-bold text-white">{teacherStats.totalStudents}</p>
      </div>
      <div className="bg-blue-500/20 p-3 rounded-full">
        <FiUsers className="text-blue-400 text-xl" />
      </div>
    </div>
  </div>

  {/* الكورسات */}
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xl">الكورسات</p>
        <p className="text-2xl font-bold text-white">{teacherStats.totalCourses}</p>
      </div>
      <div className="bg-green-500/20 p-3 rounded-full">
        <FiBook className="text-green-400 text-xl" />
      </div>
    </div>
  </div>

  {/* التقييم */}
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xl">التقييم</p>
        <p className="text-2xl font-bold text-white">{teacherStats.rating}/5</p>
      </div>
      <div className="bg-yellow-500/20 p-3 rounded-full">
        <FiStar className="text-yellow-400 text-xl" />
      </div>
    </div>
  </div>

  {/* الجلسات */}
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xl">الجلسات المكتملة</p>
        <p className="text-2xl font-bold text-white">{teacherStats.completedSessions}</p>
      </div>
      <div className="bg-purple-500/20 p-3 rounded-full">
        <FiCalendar className="text-purple-400 text-xl" />
      </div>
    </div>
  </div>

  {/* الأرباح */}
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-lg transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xl">الأرباح</p>
        <p className="text-2xl font-bold text-white">
          {teacherStats.earnings.toLocaleString()} ج.م
        </p>
      </div>
      <div className="bg-green-500/20 p-3 rounded-full">
        <DollarIcon className="text-green-400 text-xl" />
      </div>
    </div>
  </div>
</div>


          {/* التفاصيل */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* البطاقة الشخصية */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="text-center mb-6">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-700 shadow-lg"
                  />
                  <h2 className="text-2xl font-bold mt-4">{teacher.name}</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                    <FiMail className="text-blue-400 ml-3" />
                    <div>
                      <p className="text-sm text-gray-400">البريد الإلكتروني</p>
                      <p className="text-white">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                    <FiPhone className="text-green-400 ml-3" />
                    <div>
                      <p className="text-sm text-gray-400">رقم الهاتف</p>
                      <p className="text-white">{teacher.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                    <FiUser className="text-purple-400 ml-3" />
                    <div>
                      <p className="text-sm text-gray-400">الرقم القومي</p>
                      <p className="text-white">{teacher.national_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                    <FiFlag className="text-red-400 ml-3" />
                    <div>
                      <p className="text-sm text-gray-400">البلد</p>
                      <div className="flex items-center">
                        <img src={teacher.country.image} alt={teacher.country.name} className="w-6 h-6 rounded-full ml-2" />
                        <span className="text-white">{teacher.country.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* باقي التفاصيل */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* أكاديمية */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <FiBook className="ml-2 text-blue-400" />
                    المعلومات الأكاديمية
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                      <span className="text-gray-400">المرحلة:</span>
                      <span className="text-white font-medium">{teacher.stage.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                      <span className="text-gray-400">المادة:</span>
                      <span className="text-white font-medium">{teacher.subject.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                      <span className="text-gray-400">ترتيب المادة:</span>
                      <span className="text-white font-medium">{teacher.subject.postion}</span>
                    </div>
                  </div>
                </div>

                {/* بنكية */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <FiCreditCard className="ml-2 text-green-400" />
                    المعلومات البنكية
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-750 rounded-lg">
                      <p className="text-sm text-gray-400">صاحب الحساب</p>
                      <p className="text-white">{teacher.account_holder_name}</p>
                    </div>
                    <div className="p-3 bg-gray-750 rounded-lg">
                      <p className="text-sm text-gray-400">رقم الحساب</p>
                      <p className="text-white">{teacher.account_number}</p>
                    </div>
                    <div className="p-3 bg-gray-750 rounded-lg">
                      <p className="text-sm text-gray-400">الآيبان</p>
                      <p className="text-white">{teacher.iban}</p>
                    </div>
                    <div className="p-3 bg-gray-750 rounded-lg">
                      <p className="text-sm text-gray-400">اسم الفرع</p>
                      <p className="text-white">{teacher.branch_name}</p>
                    </div>
                  </div>
                </div>

                {/* المحافظ */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <FiDollarSign className="ml-2 text-yellow-400" />
                    المحافظ الإلكترونية
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-750 rounded-lg">
                      <p className="text-sm text-gray-400">نوع المحفظة</p>
                      <p className="text-white">{teacher.wallets_name}</p>
                    </div>
                    <div className="p-3 bg-gray-750 rounded-lg">
                      <p className="text-sm text-gray-400">رقم المحفظة</p>
                      <p className="text-white">{teacher.wallets_number}</p>
                    </div>
                  </div>
                </div>

                {/* المستندات */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <FiAward className="ml-2 text-purple-400" />
                    المستندات
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">صورة الشهادة</p>
                      <a href={teacher.certificate_image} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={teacher.certificate_image} alt="شهادة" className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">صورة الخبرة</p>
                      <a href={teacher.experience_image} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={teacher.experience_image} alt="خبرة" className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
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

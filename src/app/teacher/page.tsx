'use client';

import Layout from '@/components/Layoutteacher';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { FiUsers, FiBook, FiStar, FiDollarSign, FiTrendingUp, FiUser } from 'react-icons/fi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

type Country = {
  id: number;
  name: string;
  key: string;
  code: string;
  active: boolean;
  image: string;
};

type Course = {
  course_name: string;
  students_count: number;
  course_income: number;
  teacher_share: number;
};

type Teacher = {
  id: number;
  name: string;
  email: string;
  secound_email: string;
  active: boolean;
  type: string;
  teacher_type: string;
  total_rate: number;
  phone: string;
  national_id: string;
  image: string | null;
  certificate_image: string | null;
  experience_image: string | null;
  id_card_front: string | null;
  id_card_back: string | null;
  country: Country;
  account_holder_name: string | null;
  account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  branch_name: string | null;
  postal_transfer_full_name: string | null;
  postal_transfer_office_address: string | null;
  postal_transfer_recipient_name: string | null;
  postal_transfer_recipient_phone: string | null;
  wallets_name: string | null;
  wallets_number: string | null;
  commission: string;
  courses_count: number;
  students_count: number;
  total_income: number;
  courses: Course[];
  rewards: string;
  average_rating: number;
};

type ApiResponse = {
  result: string;
  data: null;
  message: {
    message: string;
    teacher: Teacher;
  };
  status: number;
};

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-800 font-medium">{payload[0].name}</p>
        <p className="text-blue-600 font-semibold">
          {payload[0].value} طالب
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const API_URL = '/api';

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = Cookies.get('teacher_token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`${API_URL}/teachers/check-auth`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data: ApiResponse = await response.json();

        if (data.result === 'Success' && data.message.teacher) {
          setTeacher(data.message.teacher);
          
          // تحويل بيانات الكورسات إلى تنسيق مناسب للرسم البياني
          if (data.message.teacher.courses && data.message.teacher.courses.length > 0) {
            const formattedData = data.message.teacher.courses.map((course) => ({
              name: course.course_name,
              طلاب: course.students_count,
              إيرادات: course.course_income,
              teacherShare: course.teacher_share
            }));
            setCourseData(formattedData);
          }

          // بيانات التوزيع الجغرافي
          setCategoryData([
            { name: data.message.teacher.country.name, value: data.message.teacher.students_count }
          ]);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!teacher) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">حدث خطأ في تحميل البيانات</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة تحكم المعلم</h1>
          <p className="text-gray-600">نظرة عامة على أدائك وإحصائياتك</p>
        </div>
        
        {/* معلومات المعلم */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                {teacher.image ? (
                  <img 
                    src={teacher.image} 
                    alt={teacher.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <FiUser className="text-white text-2xl" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{teacher.name}</h2>
                <p className="text-gray-600">{teacher.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{teacher.country.name}</span>
                  <span className="text-blue-600 font-medium">• {teacher.commission} عمولة</span>
                </div>
              </div>
            </div>
            <div className="text-left bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4 py-3 border border-blue-200">
              <p className="text-blue-600 text-sm font-medium">نسبة العمولة</p>
              <p className="text-2xl font-bold text-blue-700">{teacher.commission}</p>
            </div>
          </div>
        </div>
        
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* الطلاب */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-2">إجمالي الطلاب</h2>
                <p className="text-3xl font-bold text-gray-800">{teacher.students_count}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="text-green-500 text-sm" />
                  <span className="text-green-600 text-sm font-medium">+12%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          {/* الكورسات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-2">إجمالي الكورسات</h2>
                <p className="text-3xl font-bold text-gray-800">{teacher.courses_count}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="text-green-500 text-sm" />
                  <span className="text-green-600 text-sm font-medium">+5%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                <FiBook className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* التقييم */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-2">متوسط التقييم</h2>
                <p className="text-3xl font-bold text-gray-800">{teacher.average_rating}/5</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(teacher.average_rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                <FiStar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          {/* الأرباح */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-2">إجمالي الأرباح</h2>
                <p className="text-3xl font-bold text-gray-800">${teacher.total_income.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FiTrendingUp className="text-green-500 text-sm" />
                  <span className="text-green-600 text-sm font-medium">+18%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <FiDollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* قسم الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم بياني عمودي */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">أداء الكورسات</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">الطلاب</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">الإيرادات</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              {courseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="طلاب" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      name="عدد الطلاب"
                    />
                    <Bar 
                      dataKey="إيرادات" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      name="الإيرادات ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FiBook className="text-4xl text-gray-300 mb-2" />
                  <p>لا توجد بيانات للعرض</p>
                  <p className="text-sm text-gray-400">ابدأ بإضافة كورساتك الأولى</p>
                </div>
              )}
            </div>
          </div>
          
          {/* رسم بياني دائري */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">توزيع الطلاب</h2>
              <div className="text-sm text-gray-500">
                حسب الجنسية
              </div>
            </div>
            <div className="h-80">
              {categoryData.length > 0 && teacher.students_count > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FiUsers className="text-4xl text-gray-300 mb-2" />
                  <p>لا توجد بيانات للعرض</p>
                  <p className="text-sm text-gray-400">لا يوجد طلاب مسجلين بعد</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* قسم الكورسات */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">كورساتي</h2>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
              {teacher.courses_count} كورس
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الكورس</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الطلاب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إيرادات الكورس</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حصتي</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacher.courses && teacher.courses.length > 0 ? (
                  teacher.courses.map((course, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-gray-800 font-medium">{course.course_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <FiUsers className="text-gray-400 text-sm" />
                          <span className="text-gray-600">{course.students_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <FiDollarSign className="text-gray-400 text-sm" />
                          <span className="text-gray-600">${course.course_income.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <FiDollarSign className="text-green-500 text-sm" />
                          <span className="text-green-600 font-semibold">${course.teacher_share.toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <FiBook className="text-3xl text-gray-300 mb-2" />
                        <p>لا توجد كورسات حتى الآن</p>
                        <p className="text-sm text-gray-400 mt-1">ابدأ بإضافة كورسك الأول</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
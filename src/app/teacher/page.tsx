"use client";

import Layout from '@/components/Layoutteacher';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { useTeacherAuth } from '@/contexts/teacherAuthContext';
import { useEffect, useState } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
type Subject = {
  name: string;
};

type Stage = {
  name: string;
};

type Course = {
  course_name: string;
  students_count: number;
  course_income: number;
  teacher_share: number;
};

type User = {
  name: string;
  email: string;
  subject?: Subject;
  stage?: Stage;
  commission?: string;
  students_count?: number;
  courses_count?: number;
  total_income?: number;
  courses?: Course[];
  // أضف باقي الخصائص حسب الحاجة
};

// بيانات افتراضية للاستخدام حتى يتم جلب البيانات الحقيقية
const defaultCourseData = [
  { name: 'يناير', طلاب: 40, إيرادات: 2400 },
  { name: 'فبراير', طلاب: 30, إيرادات: 1398 },
  { name: 'مارس', طلاب: 20, إيرادات: 9800 },
  { name: 'أبريل', طلاب: 27, إيرادات: 3908 },
  { name: 'مايو', طلاب: 18, إيرادات: 4800 },
  { name: 'يونيو', طلاب: 23, إيرادات: 3800 },
];

export default function DashboardPage() {
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  const { user } = useTeacherAuth()as { user: User };
  const [courseData, setCourseData] = useState(defaultCourseData);
  const [categoryData, setCategoryData] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalHours: 2840,
    totalIncome: 0
  });

  useEffect(() => {
    if (user) {
      // تحديث الإحصائيات من بيانات المستخدم
      setStats({
        totalStudents: user.students_count || 0,
        totalCourses: user.courses_count || 0,
        totalHours: 2840, // هذه القيمة قد تحتاج إلى جلبها من API منفصل
        totalIncome: user.total_income || 0
      });

      // تحويل بيانات الكورسات إلى تنسيق مناسب للرسم البياني
      if (user.courses && user.courses.length > 0) {
        const formattedData = user.courses.map((course, index) => ({
          name: course.course_name,
          طلاب: course.students_count,
          إيرادات: course.course_income,
          teacherShare: course.teacher_share
        }));
        setCourseData(formattedData);
      }

      // بيانات التصنيفات (يمكن استبدالها ببيانات حقيقية)
      setCategoryData([
       
      ]);
    }
  }, [user]);

  return (
    <Layout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">لوحة تحكم المعلم</h1>
        
        {/* معلومات المعلم */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user?.name || 'المعلم'}</h2>
                <p className="text-gray-600 dark:text-gray-300">{user?.email || 'example@example.com'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.subject?.name || 'المادة'} - {user?.stage?.name || 'المرحلة'}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-gray-600 dark:text-gray-300">نسبة العمولة</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-300">{user?.commission || '50%'}</p>
            </div>
          </div>
        </div>
        
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div className="mr-4">
                <h2 className="text-gray-600 dark:text-gray-300 text-sm">إجمالي الطلاب</h2>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path>
                </svg>
              </div>
              <div className="mr-4">
                <h2 className="text-gray-600 dark:text-gray-300 text-sm">إجمالي الكورسات</h2>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="mr-4">
                <h2 className="text-gray-600 dark:text-gray-300 text-sm">ساعات التعلم</h2>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalHours}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="mr-4">
                <h2 className="text-gray-600 dark:text-gray-300 text-sm">إجمالي الأرباح</h2>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalIncome}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* قسم الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم بياني عمودي */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">أداء الكورسات</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="طلاب" fill="#8884d8" />
                  <Bar dataKey="إيرادات" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* رسم بياني دائري */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">توزيع الطلاب حسب الجنسية</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* قسم إضافي مع رسوم بيانية أخرى */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* رسم بياني خطي */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">تطور عدد الطلاب</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="طلاب" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* رسم بياني مساحي */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">نمو الإيرادات</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="إيرادات" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* قسم الكورسات */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">كورساتي</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اسم الكورس</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">عدد الطلاب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">إيرادات الكورس</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">حصتي</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {user?.courses && user.courses.length > 0 ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user.courses.map((course, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-right">{course.course_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">{course.students_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">${course.course_income}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">${course.teacher_share}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                      لا توجد كورسات حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* معلومات الحساب البنكي */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">معلومات الحساب البنكي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">المعلومات المصرفية</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">اسم صاحب الحساب:</span> {user?.account_holder_name || 'غير مضبوط'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">رقم الحساب:</span> {user?.account_number || 'غير مضبوط'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">IBAN:</span> {user?.iban || 'غير مضبوط'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">SWIFT Code:</span> {user?.swift_code || 'غير مضبوط'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">اسم الفرع:</span> {user?.branch_name || 'غير مضبوط'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">المحافظ الإلكترونية</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">اسم المحفظة:</span> {user?.wallets_name || 'غير مضبوط'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">رقم المحفظة:</span> {user?.wallets_number || 'غير مضبوط'}
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  );
}
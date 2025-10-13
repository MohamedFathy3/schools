'use client';

import Layout from '@/components/Layout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';

// بيانات نموذجية للرسوم البيانية
const courseData = [
  { name: 'يناير', طلاب: 0, إيرادات: 0 },
  { name: 'فبراير', طلاب: 0, إيرادات:  0},
  { name: 'مارس', طلاب: 0, إيرادات: 0 },
  { name: 'أبريل', طلاب: 0, إيرادات: 0 },
  { name: 'مايو', طلاب: 0, إيرادات: 0 },
  { name: 'يونيو', طلاب: 0, إيرادات: 0 },
];

const categoryData = [
  { name: 'مصر', value: 0 },
  { name: 'السعودية', value: 0 },
  { name: 'تركيا', value: 0 },
  { name: 'سوريا', value: 0 },
  { name: 'لبنان', value: 0 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Custom Tooltip Component for Pie Chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-blue-600 font-bold">{data.value}%</p>
      </div>
    );
  }
  return null;
};

// Custom Label for Pie Chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-600 mt-1">نظرة عامة على إحصائيات المنصة</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            آخر تحديث: اليوم {new Date().toLocaleDateString('ar-EG')}
          </div>
        </div>
        
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'إجمالي الطلاب', 
              value: '0,0', 
              icon: '👨‍🎓', 
              color: 'blue', 
              change: '+12%',
              bgColor: 'bg-blue-50',
              borderColor: 'border-blue-200',
              textColor: 'text-blue-600'
            },
            { 
              title: 'إجمالي الكورسات', 
              value: '0', 
              icon: '📚', 
              color: 'green', 
              change: '+5%',
              bgColor: 'bg-green-50',
              borderColor: 'border-green-200',
              textColor: 'text-green-600'
            },
            { 
              title: 'ساعات التعلم', 
              value: '0,0', 
              icon: '⏰', 
              color: 'yellow', 
              change: '+8%',
              bgColor: 'bg-yellow-50',
              borderColor: 'border-yellow-200',
              textColor: 'text-yellow-600'
            },
            { 
              title: 'الإيرادات', 
              value: '$0,0', 
              icon: '💰', 
              color: 'purple', 
              change: '+15%',
              bgColor: 'bg-purple-50',
              borderColor: 'border-purple-200',
              textColor: 'text-purple-600'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full border ${stat.change.startsWith('+') ? 'border-green-200' : 'border-red-200'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* قسم الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* رسم بياني عمودي */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">تطور عدد الطلاب والإيرادات</h2>
              <div className="flex space-x-2 space-x-reverse">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg font-medium border border-blue-200">شهري</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200">سنوي</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Legend />
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
                    name="الإيرادات"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* رسم بياني دائري */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">توزيع الطلاب حسب الجنسية</h2>
              <div className="text-sm text-gray-500">
                النسبة المئوية
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      paddingLeft: '20px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* قسم إضافي مع رسوم بيانية أخرى */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* رسم بياني خطي */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">معدل إكمال الكورسات</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="طلاب" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#3B82F6' }}
                    name="نسبة الإكمال"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* رسم بياني مساحي */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">نمو الإيرادات</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="إيرادات" 
                    stroke="#10B981" 
                    fill="url(#colorRevenue)" 
                    strokeWidth={3}
                    name="الإيرادات"
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* قسم الكورسات الحديثة */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">أحدث الكورسات</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg">
              عرض الكل
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right pb-4 px-6 text-sm font-semibold text-gray-600">اسم الكورس</th>
                  <th className="text-right pb-4 px-6 text-sm font-semibold text-gray-600">المعلم</th>
                  <th className="text-right pb-4 px-6 text-sm font-semibold text-gray-600">عدد الطلاب</th>
                  <th className="text-right pb-4 px-6 text-sm font-semibold text-gray-600">التقييم</th>
                  <th className="text-right pb-4 px-6 text-sm font-semibold text-gray-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'تطوير تطبيقات الويب باستخدام React', teacher: 'أحمد محمد', students: 245, rating: 4.8, status: 'نشط' },
                  { name: 'تعلم Machine Learning من الصفر', teacher: 'سارة عبدالله', students: 187, rating: 4.9, status: 'نشط' },
                  { name: 'التصميم الجرافيكي للمبتدئين', teacher: 'خالد حسن', students: 312, rating: 4.7, status: 'مكتمل' },
                  { name: 'تعلم اللغة الإنجليزية للمحترفين', teacher: 'ليلى أحمد', students: 156, rating: 4.6, status: 'نشط' },
                  { name: 'برمجة تطبيقات الموبايل', teacher: 'محمد علي', students: 278, rating: 4.8, status: 'مكتمل' }
                ].map((course, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-right">
                      <div className="font-medium text-gray-800">{course.name}</div>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600">{course.teacher}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-medium text-gray-800">{course.students.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm mr-1"> طالب</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end">
                        <div className="flex text-yellow-400 ml-1">
                          {'★'.repeat(Math.floor(course.rating))}
                          {'☆'.repeat(5 - Math.floor(course.rating))}
                        </div>
                        <span className="font-medium text-gray-800 mr-1">({course.rating})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        course.status === 'نشط' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
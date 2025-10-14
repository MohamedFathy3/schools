'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Types
interface DashboardStats {
  total_students: number;
  total_courses: number;
  total_instructors: number;
  total_revenue: number;
  students_change: string;
  courses_change: string;
  instructors_change: string;
  revenue_change: string;
}

interface MonthlyData {
  name: string;
  طلاب: number;
  إيرادات: number;
  كورسات: number;
}

interface CountryData {
  name: string;
  value: number;
  visitors: number;
}

interface RecentCourse {
  id: number;
  name: string;
  teacher: string;
  students: number;
  rating: number;
  final_price: number;
  revenue: number;
  created_at: string;
}

interface DashboardData {
  dashboard_stats: DashboardStats;
  monthly_data: MonthlyData[];
  visitors_by_country: CountryData[];
  recent_courses: RecentCourse[];
}

// Custom Tooltip Components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
       <p className="font-semibold text-gray-800 mb-2">{label}</p>
       {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} 
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-blue-600 font-bold">{data.value}%</p>
        <p className="text-gray-600 text-sm">{data.visitors} visitors</p>
      </div>
    );
  }
  return null;
};
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/dashboard-stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result && result.dashboard_stats) {
          setDashboardData(result);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">❌ {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">No data available</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { dashboard_stats, monthly_data, visitors_by_country, recent_courses } = dashboardData;

  // Prepare chart data with proper field names
  const barChartData = monthly_data.map(item => ({
    name: item.name,
    students: item.طلاب,
    revenue: item.إيرادات,
    courses: item.كورسات
  }));

  const lineChartData = monthly_data.map(item => ({
    name: item.name,
    students: item.طلاب,
    courses: item.كورسات
  }));

  const areaChartData = monthly_data.map(item => ({
    name: item.name,
    revenue: item.إيرادات
  }));

  // Fix for PieChart data type issue
  const pieChartData = visitors_by_country.map(item => ({
    ...item,
    // Ensure the data has the required structure for PieChart
    value: item.value,
    name: item.name
  }));

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of platform statistics</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            Last update: {new Date().toLocaleDateString('en-US')}
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Total Students', 
              value: dashboard_stats.total_students.toLocaleString(), 
              icon: '👨‍🎓', 
              change: dashboard_stats.students_change,
              bgColor: 'bg-blue-50',
              borderColor: 'border-blue-200'
            },
            { 
              title: 'Total Courses', 
              value: dashboard_stats.total_courses.toLocaleString(), 
              icon: '📚', 
              change: dashboard_stats.courses_change,
              bgColor: 'bg-green-50',
              borderColor: 'border-green-200'
            },
            { 
              title: 'Total Instructors', 
              value: dashboard_stats.total_instructors.toLocaleString(), 
              icon: '👨‍🏫', 
              change: dashboard_stats.instructors_change,
              bgColor: 'bg-yellow-50',
              borderColor: 'border-yellow-200'
            },
            { 
              title: 'Total Revenue', 
              value: `$${dashboard_stats.total_revenue.toFixed(2)}`, 
              icon: '💰', 
              change: dashboard_stats.revenue_change,
              bgColor: 'bg-purple-50',
              borderColor: 'border-purple-200'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') 
                      ? 'text-green-600 bg-green-50 border border-green-200' 
                      : stat.change.startsWith('-')
                      ? 'text-red-600 bg-red-50 border border-red-200'
                      : 'text-gray-600 bg-gray-50 border border-gray-200'
                  } px-2 py-1 rounded-full`}>
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
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart - Students & Revenue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Students & Revenue Growth</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg font-medium border border-blue-200">
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="students" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    name="Students"
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Pie Chart - Visitors by Country */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Visitors by Country</h2>
              <div className="text-sm text-gray-500">
                Percentage Distribution
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Line Chart - Students & Courses */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Students & Courses Progress</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3B82F6' }}
                    name="Students"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="courses" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#F59E0B' }}
                    name="Courses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Area Chart - Revenue Growth */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Growth</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    fill="url(#colorRevenue)" 
                    strokeWidth={3}
                    name="Revenue"
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
        
        {/* Recent Courses Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Courses</h2>
            <div className="text-sm text-gray-500">
              Total: {recent_courses.length} courses
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-4 px-6 text-sm font-semibold text-gray-600">Course Name</th>
                  <th className="text-left pb-4 px-6 text-sm font-semibold text-gray-600">Teacher</th>
                  <th className="text-left pb-4 px-6 text-sm font-semibold text-gray-600">Students</th>
                  <th className="text-left pb-4 px-6 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left pb-4 px-6 text-sm font-semibold text-gray-600">Revenue</th>
                  <th className="text-left pb-4 px-6 text-sm font-semibold text-gray-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent_courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{course.name}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{course.teacher}</td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-800">{course.students}</span>
                      <span className="text-gray-500 text-sm ml-1">students</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-green-600">
                        ${course.final_price.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-blue-600">
                        ${course.revenue.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(course.created_at).toLocaleDateString('en-US')}
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
'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, User, LogOut, Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useTeacherAuth } from '@/contexts/teacherAuthContext'

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useTeacherAuth()
  const router = useRouter()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/teacher/login')
  }

  // استخدام الصورة الحقيقية من بيانات المستخدم إذا كانت موجودة
  // أو أيقونة افتراضية إذا لم تكن الصورة متاحة
  const getAvatarContent = () => {
    if (user?.image) {
      return (
        <img
          src={user.image}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
        />
      )
    }
    
    // إذا لم توجد صورة، عرض أيقونة المستخدم
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-gray-300">
        <User className="h-4 w-4 text-blue-600" />
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
          title="Toggle Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div className="relative w-full max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث هنا..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
              title="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">الإشعارات</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm text-gray-700">📩 لديك رسالة جديدة من الطالب</p>
                    <span className="text-xs text-gray-500">منذ 5 دقائق</span>
                  </div>
                  <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm text-gray-700">✅ تمت الموافقة على طلب السحب</p>
                    <span className="text-xs text-gray-500">منذ ساعة</span>
                  </div>
                  <div className="p-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-700">🎓 طالب جديد انضم إلى دورة</p>
                    <span className="text-xs text-gray-500">منذ 3 ساعات</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
            >
              {getAvatarContent()}
              <div className="hidden md:block text-right">
                <span className="block text-sm font-medium text-gray-800">
                  {user?.name || 'Guest'}
                </span>
                <span className="block text-xs text-gray-500">
                  {user?.email || 'teacher@example.com'}
                </span>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {getAvatarContent()}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'teacher@example.com'}</p>
                    </div>
                  </div>
                </div>
                
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">الإعدادات</span>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-red-600 border-t border-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">تسجيل الخروج</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
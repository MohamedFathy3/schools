'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth()
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
    router.push('/dashboard/auth')
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=3B82F6&color=ffffff&bold=true`

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div className="relative w-full max-w-md mx-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث هنا..."
            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
            >
              <Bell className="h-5 w-5" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">الإشعارات</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="p-6 text-center">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">لا توجد إشعارات جديدة</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
            >
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name || 'المسؤول'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'مسؤول النظام' : 'مستخدم'}
                </p>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">{user?.name || 'المسؤول'}</p>
                  <p className="text-sm text-gray-500">{user?.email || ''}</p>
                </div>
                <ul className="py-2">
                  <li className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600 transition-colors duration-200 font-medium"
                    >
                      تسجيل الخروج
                    </button>
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
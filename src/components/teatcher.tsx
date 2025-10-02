'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageCircle,
  User as UserIcon,
} from 'lucide-react'
import { FiArrowDownCircle } from 'react-icons/fi'

import { useState, useEffect } from 'react'

const API_URL = '/api/admin/messages'

export default function Sidebar({
  open,
  collapsed,
  onClose,
}: {
  open: boolean
  collapsed: boolean
  onClose: () => void
}) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/teacher' },
    { name: 'Course', icon: UserIcon, href: '/teacher/courses' },
    { name: 'Create Course', icon: UserIcon, href: '/teacher/create_course' },
    { name: 'Withdraw money', icon: FiArrowDownCircle, href: '/teacher/money' },
    { name: 'Chat', icon: MessageCircle, href: '/teacher/showchat' },
  ]

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()

        if (data.result === 'Success') {
          // حساب عدد الرسائل غير المقروءة (is_read = 0)
          const unreadMessages = data.messages.filter(
            (message: { is_read: number }) => message.is_read === 0
          )
          setUnreadMessagesCount(unreadMessages.length)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
  }, [])

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-700 transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 px-4">
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
              E
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              ERP System
            </h1>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            // عرض النقطة الحمراء فقط إذا كان هناك رسائل غير مقروءة (unreadMessagesCount > 0)
            const showAlert = item.name === 'Chat' && unreadMessagesCount > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
                {/* عرض النقطة الحمراء الوميضية فقط إذا كان هناك رسائل غير مقروءة */}
                {showAlert && (
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    {!collapsed && unreadMessagesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageCircle,
  User as UserIcon,
  Library,
  
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
  const [activeItem, setActiveItem] = useState('')
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/teacher' },
    { name: 'Course', icon: UserIcon, href: '/teacher/courses' },
    { name: 'Create Course', icon: UserIcon, href: '/teacher/create_course' },
    { name: 'Withdraw money', icon: FiArrowDownCircle, href: '/teacher/money' },
    { name: 'Library', icon: Library, href: '/teacher/library' },
    { name: 'Chat', icon: MessageCircle, href: '/teacher/showchat' },
    { name: 'Profile', icon: UserIcon, href: '/teacher/Profile' },
  ]

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(API_URL)
        const data = await response.json()

        if (data.result === 'Success') {
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

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold transition-transform duration-300 hover:scale-110">
              E
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-800 transition-all duration-300">
              ERP System
            </h1>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const showAlert = item.name === 'Chat' && unreadMessagesCount > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleItemClick(item.name)}
                className={`
                  relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ease-out group
                  ${isActive
                    ? 'bg-blue-100 text-blue-600 shadow-sm scale-[1.02]'
                    : 'text-gray-600 hover:bg-gray-100 hover:scale-[1.02]'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-1 bg-blue-600 rounded-r-full transform -translate-y-1/2 animate-in slide-in-from-left duration-300" />
                )}
                
                {/* Icon */}
                <div className={`
                  transition-transform duration-300
                  ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                `}>
                  <item.icon className="h-5 w-5 shrink-0" />
                </div>
                
                {/* Text */}
                {!collapsed && (
                  <span className={`
                    text-sm font-medium transition-all duration-300
                    ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}
                    ${collapsed ? 'opacity-0' : 'opacity-100'}
                  `}>
                    {item.name}
                  </span>
                )}
                
                {/* Alert badge */}
                {showAlert && (
                  <div className="relative ml-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute -top-1 -right-1"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    {!collapsed && unreadMessagesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
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
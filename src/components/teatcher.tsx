'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  MessageCircle,
  User as UserIcon,
} from 'lucide-react'
import { FiArrowDownCircle } from 'react-icons/fi'

import { useState } from 'react'

export default function Sidebar({
  open,
  collapsed,
  onClose,
}: {
  open: boolean
  collapsed: boolean
  onClose: () => void
}) {
  const [openDropdown, setOpenDropdown] = useState(false)
  const pathname = usePathname()

  const navItems = [
     { name: 'Dashboard', icon: Home, href: '/teacher' },
    { name: 'Course', icon: UserIcon, href: '/teacher/courses' },
    { name: 'Create Course', icon: UserIcon, href: '/teacher/create_course' },
    { name: 'Withdraw money', icon: FiArrowDownCircle, href: '/teacher/money' },
  // { name: 'Chat', icon: MessageCircle, href: '/teacher/chat' },
  ]

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
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

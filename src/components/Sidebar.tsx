'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Database,
  ComputerIcon,
  User as UserIcon,
  Globe,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  MessageCircle,
  Library,
  Ticket
} from 'lucide-react'
import { useState } from 'react'
import { FiArrowDownCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

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
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Country', icon: Globe, href: '/dashboard/Country' },
    { name: 'Pending Teachers', icon: Users, href: '/dashboard/pandding_Teachers' },
    { name: 'Subject', icon: BookOpen, href: '/dashboard/subject' },
    { name: 'Stages', icon: GraduationCap, href: '/dashboard/Stages' },
    { name: 'Course', icon: BookOpen, href: '/dashboard/course' },
    { name: 'Withdraw money', icon: DollarSign, href: '/dashboard/money' },
    { name: 'chat', icon: MessageCircle, href: '/dashboard/sendchat' },
    { name: 'library', icon: Library, href: '/dashboard/library' },
    { name: 'coupon', icon: Ticket, href: '/dashboard/coupon' },
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
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-blue-100 transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 border-b border-blue-100 px-4">
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
              E
            </div>
          ) : (
            <h1 className="text-xl font-bold text-blue-700">
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
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                {/* الأنميشن للعنصر النشط فقط */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-blue-50 rounded-lg border-r-4 border-blue-600"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon className={`h-5 w-5 shrink-0 relative z-10 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {!collapsed && (
                  <span className="text-sm font-medium relative z-10">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-blue-100 p-4">
          {!collapsed && (
            <div className="text-center">
              <p className="text-xs text-blue-500">ERP System v1.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
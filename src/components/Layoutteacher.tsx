'use client'
import Sidebar from './teatcher'
import Navbar from './teatcherNav'
import { useState } from 'react'
import { TeacherAuthProvider } from '@/contexts/teacherAuthContext'

export default function Layoutteacher({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => setCollapsed(!collapsed)

  return (
        <TeacherAuthProvider>

    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-4 bg-gray-100 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
        </TeacherAuthProvider>

  )
}

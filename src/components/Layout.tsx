'use client'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => setCollapsed(!collapsed)

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-4 bg-gray-100 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

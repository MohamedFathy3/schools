'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { teacherApi, Teacher } from '@/lib/teacherApi'

interface TeacherAuthContextType {
  user: Teacher | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (user: Teacher) => void
  refreshUser: () => Promise<void>
}

const TeacherAuthContext = createContext<TeacherAuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
  refreshUser: async () => {},
})

export function TeacherAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // ✅ تحميل بيانات المستخدم
  const loadUser = async () => {
    try {
      setLoading(true)
      const teacher = await teacherApi.checkAuth()
      setUser(teacher)
    } catch (error) {
      console.error('Error loading user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ✅ عند تحميل التطبيق
  useEffect(() => {
    loadUser()
  }, [])

  // ✅ حماية المسارات
  useEffect(() => {
    if (!loading && pathname?.startsWith('/teacher') && !user && pathname !== '/teacher/login') {
      router.push('/teacher/login')
    }
  }, [pathname, loading, user, router])

  // ✅ تسجيل الدخول
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await teacherApi.login(email, password)
      if (data.teacher) {
        setUser(data.teacher)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // ✅ تسجيل الخروج
  const logout = () => {
    teacherApi.logout()
    setUser(null)
    router.push('/teacher/login')
  }

  // ✅ تحديث بيانات المستخدم
  const updateUser = (newUser: Teacher) => {
    setUser(newUser)
    localStorage.setItem('teacher_user', JSON.stringify(newUser))
  }

  // ✅ إعادة تحميل بيانات المستخدم
  const refreshUser = async () => {
    await loadUser()
  }

  return (
    <TeacherAuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUser,
      refreshUser
    }}>
      {children}
    </TeacherAuthContext.Provider>
  )
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext)
  if (!context) {
    throw new Error('useTeacherAuth must be used within TeacherAuthProvider')
  }
  return context
}
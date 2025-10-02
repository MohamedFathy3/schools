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
  const [initialCheckDone, setInitialCheckDone] = useState(false) // 🔥 إضافة هذه السطر
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
      setInitialCheckDone(true) // 🔥 تحديث أن التحقق الأولي انتهى
    }
  }

  // ✅ عند تحميل التطبيق
  useEffect(() => {
    loadUser()
  }, [])

  // ✅ حماية المسارات - فقط بعد انتهاء التحقق الأولي
  useEffect(() => {
    if (!initialCheckDone || loading) return // 🔥 انتظر حتى ينتهي التحقق الأولي

    const isTeacherRoute = pathname?.startsWith('/teacher')
    const isLoginPage = pathname === '/teacher/login'
    
    if (isTeacherRoute && !isLoginPage && !user) {
      console.log('🔄 Redirecting to login - no user')
      router.push('/teacher/login')
    }
    
    if (isLoginPage && user) {
      console.log('🔄 Redirecting to dashboard - user exists')
      router.push('/teacher')
    }
  }, [pathname, loading, user, initialCheckDone, router]) // 🔥 إضافة initialCheckDone

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
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { usePathname, useRouter } from 'next/navigation'
import { teacherApi, Teacher } from '@/lib/teacherApi'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'




interface TeacherAuthContextType {
  user: Teacher | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (user: Teacher) => void
}

const TeacherAuthContext = createContext<TeacherAuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
})

export function TeacherAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // ✅ إعداد nprogress
  NProgress.configure({ showSpinner: false })

  useEffect(() => {
    async function loadUser() {
      const token = Cookies.get('teacher_token')
      NProgress.start()
      setLoading(true)

      if (token) {
        try {
          const teacher = await teacherApi.checkAuth()
          if (teacher) {
            setUser(teacher)
          } else {
            setUser(null)
            if (pathname !== '/teacher/login') {
              router.push('/teacher/login')
            }
          }
        } catch {
          setUser(null)
          if (pathname !== '/teacher/login') {
            router.push('/teacher/login')
          }
        }
      } else {
        setUser(null)
        if (pathname !== '/teacher/login') {
          router.push('/teacher/login')
        }
      }

      NProgress.done()
      setLoading(false)
    }

    loadUser()
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    try {
      const { teacher } = await teacherApi.login(email, password)
      setUser(teacher)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    Cookies.remove('teacher_token')
    setUser(null)
  }

  const updateUser = (newUser: Teacher) => {
    setUser(newUser)
  }

  return (
    <TeacherAuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
            zIndex: 9999,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
      {children}
    </TeacherAuthContext.Provider>
  )
}

export function useTeacherAuth() {
  return useContext(TeacherAuthContext)
}

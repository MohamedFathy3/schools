// context/authContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

interface Admin {
  id: number
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

interface LoginResponse {
  token: string
  admin: Admin
}

interface AuthContextType {
  user: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (user: Admin) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ checkAuth عند التحميل
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      const token = Cookies.get('admin_token')
      if (token) {
        try {
          const res = await fetch(`${API_URL}/admin/check-auth`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data.admin)
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error('Auth check error:', err)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  // ✅ login function
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        console.error('Login failed with status:', res.status)
        return false
      }

      const data: LoginResponse = await res.json()
      Cookies.set('admin_token', data.token, { expires: 7 })
      setUser(data.admin)
      return true
    } catch (err) {
      console.error('Login failed:', err)
      return false
    }
  }

  // ✅ logout function
  const logout = () => {
    Cookies.remove('admin_token')
    setUser(null)
  }

  const updateUser = (newUser: Admin) => {
    setUser(newUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

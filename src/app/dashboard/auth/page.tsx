// eslint-disable-next-line @typescript-eslint/no-explicit-any

'use client'
import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import '@/styles/globals.css'

// أيقونات
const FiMail = dynamic(() => import('react-icons/fi').then(mod => mod.FiMail))
const FiLock = dynamic(() => import('react-icons/fi').then(mod => mod.FiLock))
const FiUser = dynamic(() => import('react-icons/fi').then(mod => mod.FiUser))
const FiArrowRight = dynamic(() => import('react-icons/fi').then(mod => mod.FiArrowRight))

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { login, user, loading } = useAuth()

  // لو الأدمن مسجل دخول بالفعل → يروح علطول للداشبورد
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // تحقق من صحة الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('البريد الإلكتروني غير صالح ❌')
      return
    }

    // تحقق من الباسورد
    if (password.length < 4) {
      toast.error('كلمة المرور قصيرة جداً ❌')
      return
    }

    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح ✅')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        toast.error('فشل تسجيل الدخول ❌')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Login error:', err)
      toast.error('حدث خطأ أثناء تسجيل الدخول ❌')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-black relative overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #4f46e5',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        }}
      />

      <div className="relative z-10 w-full max-w-md p-10 mx-4 bg-black bg-opacity-60 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-md">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-indigo-600 bg-opacity-80 flex items-center justify-center mb-5 shadow-lg">
            <FiUser className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-white">تسجيل الدخول</h1>
          <p className="text-indigo-300 mt-2 text-sm">يرجى إدخال البريد الإلكتروني وكلمة المرور</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-indigo-300 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiMail className="text-indigo-400" />
              </div>
              <input
                type="email"
                style={{ borderRadius: '0.75rem' }}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
                className="w-full pr-10 pl-4 py-3 rounded-lg bg-gray-800 text-white placeholder-indigo-400 border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-indigo-300 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiLock className="text-indigo-400" />
              </div>
              <input
                type="password"
                style={{ borderRadius: '0.75rem' }}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pr-10 pl-4 py-3 rounded-lg bg-gray-800 text-white placeholder-indigo-400 border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* remember me */}
          <div className="flex items-center justify-between text-indigo-300 text-sm">
            <label htmlFor="rememberMe" className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                id="rememberMe"
                checked={remember}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <span>تذكرني</span>
            </label>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري التسجيل...
              </>
            ) : (
              <>
                تسجيل الدخول
                <FiArrowRight className="mr-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

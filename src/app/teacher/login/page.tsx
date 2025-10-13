'use client'
import dynamic from 'next/dynamic'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTeacherAuth } from '@/contexts/teacherAuthContext'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import Link from 'next/link'
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
  const { login, user, loading } = useTeacherAuth()

  useEffect(() => {
    if (user && !loading) {
      router.push('/teacher')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('البريد الإلكتروني غير صالح ❌')
      return
    }

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
          router.push('/teacher')
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* خلفية النقاط المتحركة */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* النقاط الكبيرة */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-float opacity-70"></div>
        <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-indigo-400 rounded-full animate-float animation-delay-1000 opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float animation-delay-2000 opacity-80"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-float animation-delay-1500 opacity-70"></div>
        <div className="absolute top-2/3 left-1/5 w-2 h-2 bg-blue-300 rounded-full animate-float animation-delay-3000 opacity-90"></div>
        
        {/* النقاط المتوسطة */}
        <div className="absolute top-1/5 right-1/5 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-float animation-delay-500 opacity-80"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float animation-delay-2500 opacity-75"></div>
        
        {/* النقاط الصغيرة */}
        <div className="absolute top-2/5 left-2/5 w-1 h-1 bg-cyan-300 rounded-full animate-float animation-delay-1800 opacity-90"></div>
        <div className="absolute bottom-2/5 right-2/5 w-1 h-1 bg-blue-200 rounded-full animate-float animation-delay-1200 opacity-85"></div>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#374151',
            color: '#fff',
            border: '1px solid #6366f1',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
          },
        }}
      />

      <div className="relative z-10 w-full max-w-md p-10 mx-4 bg-white/95 rounded-3xl shadow-2xl border border-gray-200/60 backdrop-blur-lg">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30">
            <FiUser className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600 mt-2 text-sm">يرجى إدخال البريد الإلكتروني وكلمة المرور</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiMail className="text-gray-500" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FiLock className="text-gray-500" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* remember me switch */}
          <div className="flex items-center justify-between text-gray-700 text-sm">
            <label htmlFor="rememberMe" className="flex items-center cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={remember}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-all duration-300 ${
                  remember ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <div className={`absolute left-0 top-0 w-6 h-6 rounded-full transition-all duration-300 transform ${
                  remember ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white'
                } shadow-md border border-gray-300`}></div>
              </div>
              <span className="mr-2 text-gray-700">تذكرني</span>
            </label>

            <Link 
              href="https://professionalacademyedu.com/register" 
              className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium"
            >
              ليس لديك حساب؟ سجل الآن
            </Link>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-95 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 shadow-lg shadow-blue-500/30 ${
              isLoading ? 'opacity-80 cursor-not-allowed' : ''
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2500 { animation-delay: 2.5s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-1800 { animation-delay: 1.8s; }
        .animation-delay-1200 { animation-delay: 1.2s; }
      `}</style>
    </div>
  )
}
'use client'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from 'next-themes'
import QueryProvider from '@/providers/QueryProvider'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
    </>
  )
}
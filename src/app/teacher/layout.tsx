'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TeacherAuthProvider } from '@/contexts/teacherAuthContext'
import { ThemeProvider } from 'next-themes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // مثلاً 5 دقائق
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherAuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </TeacherAuthProvider>
  )
}

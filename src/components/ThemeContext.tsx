'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  theme: string
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('light') // دايماً light

  useEffect(() => {
    // تأكد أن الـ dark class مش موجود
    document.documentElement.classList.remove('dark')
  }, [theme])

  const toggleTheme = () => {
    // ما تعملش حاجة - دايماً light
    // أو ممكن تمسح الدالة دي خالص
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import '@/styles/globals.css'

export default function NotFound() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-br from-background to-muted text-foreground p-6 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded-full border border-border"
        >
          {mounted ? (
            theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only"> toggle</span>
        </Button>
      </div>

      <div className="w-full max-w-md mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20 p-6">
            <span className="text-6xl font-bold text-destructive dark:text-destructive-foreground">404</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldnt find the page you were looking for
            </p>
          </div>
          
          <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Error path:</p>
            <code className="mt-1 text-sm font-mono break-all bg-accent/30 dark:bg-accent/50 text-foreground p-2 rounded-md inline-block">
              {pathname || 'Unknown'}
            </code>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
       
          
          <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
      
      <footer className="mt-12 text-sm text-muted-foreground">
        <p>If the problem persists, please <Link href="/contact" className="text-primary hover:underline">contact us</Link></p>
      </footer>
    </div>
  )
}
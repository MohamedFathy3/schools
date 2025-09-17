import '../styles/globals.css'
import { ThemeProvider } from '@/components/ThemeProviderClient'
import Layout from '@/components/Layout'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>NextJS Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased">
        
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

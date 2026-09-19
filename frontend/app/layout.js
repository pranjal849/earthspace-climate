import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'EarthScape — Climate Intelligence Platform',
  description: 'Monitor global climate change with real-time data, ML analytics, and interactive country-wise visualizations.',
  keywords: ['climate', 'monitoring', 'analytics', 'environment', 'earth'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

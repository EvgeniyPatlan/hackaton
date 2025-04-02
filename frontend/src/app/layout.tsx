import '../styles/globals.css'
import { ReactNode } from 'react'
import { Metadata } from 'next'
import ProviderWrapper from '@/components/ProviderWrapper'
import Header from '@/components/ui/Header'

export const metadata: Metadata = {
  title: 'Accessibility Map of Ukraine',
  description: 'A platform for sharing accessible locations in Ukraine',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-gray-50">
        <ProviderWrapper>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <footer className="bg-gray-800 text-white p-4 text-center text-sm">
              © 2025 Accessibility Map of Ukraine. All rights reserved.
            </footer>
          </div>
        </ProviderWrapper>
      </body>
    </html>
  )
}

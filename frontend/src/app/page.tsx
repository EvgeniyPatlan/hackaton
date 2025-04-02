'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const router = useRouter()
  const { t } = useTranslation()

  // Redirect to map page after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/map')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">🌐 AccessMap Ukraine</h1>
        <p className="text-xl text-gray-600 mb-8">{t('home.welcome')}</p>
        <div className="animate-pulse">
          <p className="text-sm text-gray-500">{t('home.redirecting')}</p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => router.push('/map')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('home.goToMap')}
          </button>
        </div>
      </div>
    </div>
  )
}
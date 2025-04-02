'use client'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { useState } from 'react'

export default function Header() {
  const { t, i18n } = useTranslation()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const isActive = (path: string) => pathname === path
  
  const handleLanguageChange = () => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk'
    i18n.changeLanguage(newLang)
  }
  
  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('accessToken')
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                🌐 AccessMap
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/map"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/map')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t('map.title')}
              </Link>
              
              {token && (
                <>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/dashboard')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {t('dashboard.title')}
                  </Link>
                  <Link
                    href="/locations/new"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/locations/new')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {t('locations.new.title')}
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button 
              onClick={handleLanguageChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              {i18n.language === 'uk' ? 'EN' : 'УКР'}
            </button>
            
            {token ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                {t('common.logout')}
              </button>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                {t('login.title')}
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/map"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/map')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t('map.title')}
          </Link>
          
          {token && (
            <>
              <Link
                href="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/dashboard')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('dashboard.title')}
              </Link>
              <Link
                href="/locations/new"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/locations/new')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('locations.new.title')}
              </Link>
            </>
          )}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={handleLanguageChange}
                className="ml-auto px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {i18n.language === 'uk' ? 'EN' : 'УКР'}
              </button>
            </div>
            <div>
              {token ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                  {t('common.logout')}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login.title')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
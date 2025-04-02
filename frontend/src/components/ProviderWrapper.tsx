'use client'
import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import '@/lib/i18n' // Import i18n configuration
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { usePathname, useRouter } from 'next/navigation'

// Get token from localStorage on client side
const loadAuthState = () => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        // Dispatch setToken action to Redux
        store.dispatch({ type: 'auth/setToken', payload: token })
      }
    } catch (e) {
      console.error('Failed to load auth state from localStorage', e)
    }
  }
}

interface ProviderWrapperProps {
  children: ReactNode
}

export default function ProviderWrapper({ children }: ProviderWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Load auth state from localStorage on first render
  useEffect(() => {
    loadAuthState()
  }, [])

  // Setup authentication-required route protection
  useEffect(() => {
    const token = store.getState().auth.token
    const publicPaths = ['/', '/login', '/map']
    
    // Check if route requires authentication
    const requiresAuth = !publicPaths.some(path => 
      pathname === path || pathname.startsWith('/api/')
    )
    
    // Redirect to login if auth is required but no token is present
    if (requiresAuth && !token) {
      router.push('/login')
    }
  }, [pathname, router])

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </Provider>
  )
}
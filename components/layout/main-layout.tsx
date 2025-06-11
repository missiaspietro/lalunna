'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Header } from './header'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      console.log('[MainLayout] Usuário não autenticado, redirecionando para /login')
      router.push('/login')
      return
    }
    
    console.log('[MainLayout] Usuário autenticado:', { email: user.email })
    setIsAuthorized(true)
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

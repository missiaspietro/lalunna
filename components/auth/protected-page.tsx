'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        
        // Verifica se estamos no navegador
        if (typeof window === 'undefined') {
          return
        }

        // Obtém o usuário do localStorage
        const userData = localStorage.getItem('user')
        
        if (!userData) {
          router.push('/login')
          return
        }

        const user = JSON.parse(userData)
        
        // Verifica se o usuário pertence à empresa correta
        if (user.empresa !== 'La Lunna') {
          toast.error('Acesso não autorizado')
          localStorage.removeItem('user')
          document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          router.push('/login')
          return
        }

        // Se chegou até aqui, o usuário está autorizado
        setIsAuthorized(true)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        toast.error('Erro ao verificar autenticação')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }


    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}

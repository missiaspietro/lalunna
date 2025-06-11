'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ProtectedRoute({
  children,
  requiredRole = 'any',
}: {
  children: React.ReactNode
  requiredRole?: string
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
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

      // Verifica se o usuário tem a permissão necessária
      if (requiredRole !== 'any' && user.nivel !== requiredRole) {
        toast.error('Você não tem permissão para acessar esta página')
        router.push('/dashboard')
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
  }, [router, requiredRole])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    )
  }


  return isAuthorized ? <>{children}</> : null
}

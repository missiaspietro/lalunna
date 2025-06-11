'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      toast.error('Sessão expirada. Faça login novamente.')
      router.push('/login')
    }
  }, [user, loading, router])

  // Se estiver carregando, mostra um indicador de carregamento
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  // Se o usuário não tiver uma empresa, mostra uma mensagem de erro
  if (!user.empresa) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso não autorizado</h2>
          <p className="text-gray-600 mb-6">
            Sua conta não possui uma empresa associada. Entre em contato com o suporte para regularizar sua situação.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    )
  }

  // Se estiver tudo certo, renderiza os filhos
  return <>{children}</>
}

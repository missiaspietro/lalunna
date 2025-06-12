'use client'

import { useState, useEffect } from 'react'
import { getPlanoByRede, PlanoDados } from '@/services/planoService'
import { useAuth } from '@/contexts/auth-context'

interface UsePlanoDadosResult {
  planoDados: PlanoDados | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePlanoDados(): UsePlanoDadosResult {
  const { user } = useAuth()
  const [planoDados, setPlanoDados] = useState<PlanoDados | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlanoDados = async () => {
    console.log('[DEBUG] usePlanoDados - Usuário:', user)
    
    if (!user?.empresa) {
      console.log('[DEBUG] usePlanoDados - Empresa não definida')
      setIsLoading(false)
      setError('Usuário sem empresa definida')
      return
    }

    console.log('[DEBUG] usePlanoDados - Buscando plano para empresa:', user.empresa)
    setIsLoading(true)
    setError(null)

    try {
      const dados = await getPlanoByRede(user.empresa)
      console.log('[DEBUG] usePlanoDados - Dados recebidos:', dados)
      setPlanoDados(dados)
    } catch (err: any) {
      console.error('[DEBUG] usePlanoDados - Erro ao buscar dados do plano:', err)
      // Mensagem de erro mais específica se disponível
      const errorMessage = err?.message || 'Erro ao carregar dados do plano'
      setError(errorMessage)
      setPlanoDados(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlanoDados()
  }, [user?.empresa])

  return {
    planoDados,
    isLoading,
    error,
    refetch: fetchPlanoDados
  }
}

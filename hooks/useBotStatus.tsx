'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getBotByToken } from '@/services/botService'

export function useBotStatus() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [botStatus, setBotStatus] = useState<{
    status: string | null
    isConnected: boolean
  }>({
    status: null,
    isConnected: false
  })

  useEffect(() => {
    const checkBotStatus = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        // Usa o serviço existente para buscar o status do bot
        const botData = await getBotByToken(user.id)
        
        // Determina se o bot está conectado com base no status
        const isConnected = botData?.status === 'open'
        
        setBotStatus({
          status: botData?.status || 'close',
          isConnected: isConnected
        })
      } catch (error) {
        console.error('Erro ao verificar status do bot:', error)
        setBotStatus({
          status: 'error',
          isConnected: false
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Verifica o status inicialmente
    checkBotStatus()
    
    // Configura um intervalo para verificar o status periodicamente
    const interval = setInterval(checkBotStatus, 30000) // Verifica a cada 30 segundos
    
    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval)
  }, [user?.id])

  return {
    isLoading,
    botStatus
  }
}

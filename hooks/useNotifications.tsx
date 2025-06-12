'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export interface Notification {
  id: number
  created_at: string
  empresa: string
  texto: string
  usuario: string
  status_leitura: string
  sistema: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchNotifications() {
      // Não precisamos mais verificar o usuário já que carregamos todas as notificações

      try {
        setLoading(true)
        setError(null)

        // Verificar se o cliente supabase está disponível
        if (!supabase) {
          throw new Error('Cliente Supabase não inicializado');
        }

        const { data, error } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('usuario', user?.email || '')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar notificações:', error)
          setError('Não foi possível carregar as notificações')
        } else {
          setNotifications(data || [])
        }
      } catch (err) {
        console.error('Erro ao processar notificações:', err)
        setError('Erro ao processar notificações')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user?.email, user?.empresa])

  const markAsRead = async (notificationId: number) => {
    try {
      // Verificar se o cliente supabase está disponível
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado');
        return false;
      }

      const { error } = await supabase
        .from('notificacoes')
        .update({ status_leitura: 'sim' })
        .eq('id', notificationId)

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error)
        return false
      }

      // Atualiza o estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status_leitura: 'sim' } 
            : notif
        )
      )
      
      return true
    } catch (err) {
      console.error('Erro ao processar atualização de notificação:', err)
      return false
    }
  }

  const getUnreadCount = () => {
    return notifications.filter(n => n.status_leitura === 'nao').length
  }

  return {
    notifications,
    loading,
    error,
    markAsRead,
    getUnreadCount
  }
}

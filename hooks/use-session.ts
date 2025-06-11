'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type UserData = {
  id: string
  email: string
  nome: string
  nivel: string
  empresa: string
}

export function useSession() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = () => {
      try {
        if (typeof window === 'undefined') return
        
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Verifica o usuário ao montar o componente
    checkUser()

    // Configura um listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkUser()
      }
    }

    // Adiciona um listener para o evento personalizado
    const handleCustomStorageEvent = () => {
      checkUser()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('customStorage', handleCustomStorageEvent)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('customStorage', handleCustomStorageEvent)
    }
  }, [])

  return { user, loading }
}

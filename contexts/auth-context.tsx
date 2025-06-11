'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  nome: string
  nivel: string
  empresa: string
  permissoes: {
    dashboard: boolean
    visitantes: boolean
    historico: boolean
    mensagens: boolean
    eventos: boolean
    treinamento: boolean
    conexao: boolean
    users: boolean
  }
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [loading] = useState(false) 
  const router = useRouter()

  const setUser = useCallback((userData: UserProfile | null) => {
    setUserState(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      // Dispara um evento personalizado para notificar outros componentes na mesma aba
      window.dispatchEvent(new CustomEvent('customStorage'))
      // Dispara o evento storage para notificar outras abas
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(userData)
      }))
    } else {
      localStorage.removeItem('user')
      // Dispara eventos para limpar o usuário em todas as abas
      window.dispatchEvent(new CustomEvent('customStorage'))
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: null
      }))
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      console.log('[AUTH] Fazendo logout')
      setUserState(null)
      router.push('/login')
    } catch (error) {
      console.error('[AUTH] Erro ao fazer logout:', error)
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

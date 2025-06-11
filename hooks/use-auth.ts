'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useAuth(required = true) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setIsAuthenticated(false)
          if (required) {
            router.push('/login')
          }
          return
        }

        // Busca dados adicionais do usuário
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (!userData || userData.empresa !== 'La Lunna') {
          await supabase.auth.signOut()
          setIsAuthenticated(false)
          if (required) {
            router.push('/login')
          }
          return
        }

        setUser({
          ...session.user,
          ...userData
        })
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setIsAuthenticated(false)
        if (required) {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Configura listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (userData && userData.empresa === 'La Lunna') {
          setUser({
            ...session.user,
            ...userData
          })
          setIsAuthenticated(true)
        } else {
          await supabase.auth.signOut()
          setIsAuthenticated(false)
          if (required) {
            router.push('/login')
          }
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        if (required) {
          router.push('/login')
        }
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [required, router, supabase])

  return { isAuthenticated, user, loading }
}

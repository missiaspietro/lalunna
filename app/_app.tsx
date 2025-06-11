import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import '@/styles/globals.css'

function AuthHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Verifica se estamos no navegador
    if (typeof window === 'undefined') return

    // Se estiver na página de login, não faz nada
    if (router.pathname === '/login') return

    // Verifica se há um parâmetro de sessão na URL
    const url = new URL(window.location.href)
    const sessionId = url.searchParams.get('session')

    // Se não houver sessão, redireciona para o login
    if (!sessionId) {
      const loginUrl = new URL('/login', window.location.origin)
      loginUrl.searchParams.set('from', router.pathname)
      window.location.href = loginUrl.toString()
    } else {
      // Remove o parâmetro da URL sem recarregar a página
      url.searchParams.delete('session')
      window.history.replaceState({}, '', url.toString())
    }
  }, [router.pathname])

  return <>{children}</>
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AuthHandler>
        <Component {...pageProps} />
      </AuthHandler>
    </AuthProvider>
  )
}

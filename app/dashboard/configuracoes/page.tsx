'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user || !mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua conta e do sistema</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Conta</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{user.nome || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user.email || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-medium">{user.empresa || 'Não informada'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Tema</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Escolha entre o tema claro ou escuro.
          </p>
          <div className="flex items-center space-x-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 ${
                theme === 'light' ? 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white' : ''
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Claro</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 ${
                theme === 'dark' ? 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white' : ''
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Escuro</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className={`flex items-center gap-2 ${
                theme === 'system' ? 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white' : ''
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>Sistema</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

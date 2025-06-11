"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as any)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica dos campos
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos')
      return
    }
    
    setIsLoading(true)
    console.log('[LOGIN] Iniciando processo de login...')
    console.log('[LOGIN] Email:', email)

    try {
      // Limpa erros anteriores
      setEmail(prev => prev.trim())
      setPassword(prev => prev.trim())
      
      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Por favor, insira um email válido')
      }
      
      // Validação de senha removida para compatibilidade com o Supabase personalizado
      // Verifica se o Supabase está inicializado corretamente
      if (!supabase) {
        console.error('[LOGIN] Erro: Cliente Supabase não inicializado')
        throw new Error('Erro de conexão com o servidor. Tente novamente mais tarde.')
      }
      
      console.log('[LOGIN] Cliente Supabase inicializado com sucesso')
      
      // Tenta buscar o usuário na tabela users
      console.log('[LOGIN] Buscando usuário na tabela users...')
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single()
      
      console.log('[LOGIN] Resposta da consulta:', { user, error })

      // Se houver erro na consulta ou usuário não encontrado
      if (error || !user) {
        console.log('[LOGIN] Usuário não encontrado ou senha incorreta')
        toast.error('E-mail e/ou senha incorretos. Tente novamente.')
        return
      }
      
      // Se chegou até aqui, o usuário foi encontrado
      console.log('[LOGIN] Usuário encontrado:', { 
        id: user.id, 
        email: user.email,
        empresa: user.empresa 
      })

      // Verifica se o usuário tem uma empresa definida
      if (!user.empresa) {
        console.error('[LOGIN] Usuário não tem empresa definida')
        toast.error('Sua conta não possui uma empresa associada. Entre em contato com o suporte.')
        return
      }

      // Prepara os dados do usuário para o contexto
      const userData = {
        id: user.id,
        email: user.email,
        nome: user.nome || 'Usuário',
        empresa: user.empresa,
        nivel: user.nivel || 'user',
        permissoes: {
          dashboard: user.tela_dashboard === 'sim',
          visitantes: user.tela_visitantes === 'sim',
          historico: user.tela_historico === 'sim',
          mensagens: user.tela_mensagens === 'sim',
          eventos: user.tela_eventos === 'sim',
          treinamento: user.tela_treinamento === 'sim',
          conexao: user.tela_conexao === 'sim',
          users: user.tela_users === 'sim',
        }
      }
      
      console.log('[LOGIN] Dados do usuário:', userData)
      
      // Define o usuário no contexto de autenticação
      setUser(userData)
      
      // Obtém o parâmetro 'from' da URL para redirecionamento
      const redirectPath = searchParams.get('from') || '/dashboard'
      
      // Navega para a rota desejada
      console.log('[LOGIN] Navegando para:', redirectPath)
      router.push(redirectPath)
      
    } catch (error) {
      console.error('[LOGIN] Erro durante o login:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      console.log('[LOGIN] Finalizando processo de login')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 via-fuchsia-400 to-amber-300">
      <div className="w-full max-w-md p-4">
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-0 shadow-xl">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Painel Administrativo
            </CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form 
              onSubmit={handleLogin}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleLogin(e)
                }
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="seu@email.com" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a href="#" className="text-sm text-teal-600 hover:text-teal-500">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    placeholder="••••••••" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <a href="#" className="text-teal-600 hover:text-teal-500">
                Criar conta
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

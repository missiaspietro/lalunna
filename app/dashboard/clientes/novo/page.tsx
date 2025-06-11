"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { createCliente } from "@/services/clienteService"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function NovoClientePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (máximo para celular brasileiro com DDD)
    const limited = cleaned.slice(0, 11);
    
    // Aplica a formatação
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
    }
  }

  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    empresa: user?.empresa || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.empresa) {
      console.error('[NOVO CLIENTE] Empresa não encontrada no usuário:', user)
      toast.error('Erro ao identificar a empresa. Faça login novamente.')
      return
    }

    console.log('[NOVO CLIENTE] Dados do formulário:', {
      ...formData,
      empresa: user.empresa,
      whatsapp: formData.whatsapp.replace(/\D/g, '') // Remove formatação
    })

    setIsLoading(true)

    try {
      await createCliente({
        nome: formData.nome,
        whatsapp: formData.whatsapp.replace(/\D/g, ''), // Remove formatação
        empresa: user.empresa
      })
      
      toast.success('Cliente cadastrado com sucesso!')
      router.push('/dashboard/clientes')
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error)
      toast.error('Erro ao cadastrar cliente. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/clientes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
          <p className="text-muted-foreground">Cadastre um novo cliente no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Informações Pessoais</CardTitle>
              <CardDescription>Dados básicos do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo do cliente"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    // Permite apenas números e formata o valor
                    const formattedValue = formatPhoneNumber(e.target.value);
                    setFormData({ ...formData, whatsapp: formattedValue });
                  }}
                  onKeyPress={(e) => {
                    // Permite apenas números, backspace e delete
                    if (!/[0-9\b]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                      e.preventDefault();
                    }
                  }}
                  required
                  minLength={14} // (00) 00000-0000
                  maxLength={15} // (00) 00000-0000
                />
                <p className="text-xs text-muted-foreground">
                  Formato: (DDD) 9XXXX-XXXX
                </p>
              </div>

              
            </CardContent>
          </Card>

          

          <Card className="border-0 shadow-md md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Informações Adicionais</CardTitle>
              <CardDescription>Outros detalhes do cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mais campos poderão ser adicionados conforme necessário.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/dashboard/clientes">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

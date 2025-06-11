"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getClienteById, updateCliente, type Cliente } from "@/services/clienteService"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const clienteId = Array.isArray(params.id) ? params.id[0] : params.id

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

  const [formData, setFormData] = useState<Omit<Cliente, 'id' | 'created_at' | 'empresa' | 'id_campanha'>>({
    nome: "",
    whatsapp: ""
  })

  useEffect(() => {
    const carregarCliente = async () => {
      if (!clienteId) return
      
      setIsLoading(true)
      try {
        const cliente = await getClienteById(parseInt(clienteId, 10))
        if (cliente) {
          setFormData({
            nome: cliente.nome || "",
            whatsapp: cliente.whatsapp || ""
          })
        }
      } catch (error) {
        console.error('Erro ao carregar cliente:', error)
        toast.error('Erro ao carregar dados do cliente')
      } finally {
        setIsLoading(false)
      }
    }

    carregarCliente()
  }, [clienteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.empresa || !clienteId) {
      console.error('[EDITAR CLIENTE] Dados incompletos:', { empresa: user?.empresa, clienteId })
      toast.error('Erro ao identificar a empresa ou cliente. Tente novamente.')
      return
    }

    setIsSaving(true)

    try {
      await updateCliente(parseInt(clienteId, 10), {
        nome: formData.nome || null,
        whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, '') : null,
      })
      
      toast.success('Cliente atualizado com sucesso!')
      router.push('/dashboard/clientes')
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast.error('Erro ao atualizar cliente. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando dados do cliente...</p>
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">Atualize os dados do cliente</p>
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
                  value={formData.nome || ''}
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
                  value={formData.whatsapp || ''}
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getClientes, deleteCliente, type Cliente } from "@/services/clienteService"
import { useAuth } from "@/contexts/auth-context"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        if (!user?.empresa) return
        
        setLoading(true)
        const clientesCarregados = await getClientes(user.empresa)
        setClientes(clientesCarregados)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast.error('Erro ao carregar clientes')
      } finally {
        setLoading(false)
      }
    }

    carregarClientes()
  }, [user?.empresa])

  const handleDeleteClick = (id: number) => {
    setClienteToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!clienteToDelete) return
    
    try {
      setDeletingId(clienteToDelete)
      await deleteCliente(clienteToDelete)
      setClientes(clientes.filter(cliente => cliente.id !== clienteToDelete))
      toast.success('Cliente excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast.error('Erro ao excluir cliente')
    } finally {
      setDeletingId(null)
      setClienteToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando clientes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={(confirmed) => {
          setShowDeleteDialog(false)
          if (confirmed) confirmDelete()
        }}
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            {clientes.length === 0 
              ? 'Nenhum cliente cadastrado' 
              : `${clientes.length} ${clientes.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}`}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clientes/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Total de {clientes.length} clientes cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome || 'Sem nome'}</TableCell>
                    <TableCell>{cliente.whatsapp || 'Não informado'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/clientes/editar/${cliente.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDeleteClick(cliente.id)}
                          disabled={deletingId === cliente.id}
                        >
                          {deletingId === cliente.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

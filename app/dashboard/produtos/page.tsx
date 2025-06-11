"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, AlertTriangle, Maximize2, ImageOff } from "lucide-react"
import { toast } from "sonner"
import { getProdutos, deleteProduto, type Produto } from "@/services/produtoService"
import { useAuth } from "@/contexts/auth-context"
import { ImagePreviewModal } from "@/components/ImagePreviewModal"

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null)
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string; imageUrl: string | null } | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        if (!user?.empresa) return
        
        const produtosCarregados = await getProdutos(user.empresa)
        setProdutos(produtosCarregados)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        toast.error('Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [user?.empresa])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleDeleteClick = (produto: Produto) => {
    setProductToDelete({
      id: produto.id,
      title: produto.titulo || 'Produto sem nome',
      imageUrl: produto.url_foto || null
    })
    setShowDeleteDialog(true)
  }

  const handleImageClick = (url: string, alt: string) => {
    setPreviewImage({ url, alt })
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      setDeletingId(productToDelete.id)
      await deleteProduto(productToDelete.id, productToDelete.imageUrl)
      
      setProdutos(produtos.filter(p => p.id !== productToDelete.id))
      toast.success('Produto excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error('Ocorreu um erro ao excluir o produto. Tente novamente.')
    } finally {
      setDeletingId(null)
      setShowDeleteDialog(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button asChild>
          <Link href="/dashboard/produtos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Gerencie os produtos do seu catálogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="hidden md:table-cell">Imagem</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">
                      {produto.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{produto.titulo || 'Sem título'}</p>
                        <p className="text-sm text-muted-foreground hidden md:block">
                          {produto.descricao || 'Sem descrição'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>Tamanho</span>
                        <span className="font-medium">
                          {produto.tamanho ? `${produto.tamanho} ${produto.tipo_tamanho === 'anel' ? 'nº' : 'cm'}` : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {produto.url_foto ? (
                        <div className="group relative">
                          <div 
                            className="relative w-16 h-16 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center cursor-pointer"
                            onClick={() => handleImageClick(produto.url_foto!, produto.titulo || 'Produto')}
                          >
                            <img
                              src={produto.url_foto}
                              alt={produto.titulo || 'Produto'}
                              className="object-contain max-h-full max-w-full p-1"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Sem imagem
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {produto.valor ? formatCurrency(Number(produto.valor)) : 'R$ 0,00'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={produto.status === "ATIVADO" ? "default" : "secondary"}
                        className={
                          produto.status === "ATIVADO"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-400 hover:bg-slate-500"
                        }
                      >
                        {produto.status === "ATIVADO" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/dashboard/produtos/editar/${String(produto.id)}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteClick(produto)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {produtos.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-24 h-24 text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100%"
                            height="100%"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-package-x"
                          >
                            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M3.29 7 12 12l8.71-5" />
                            <path d="M12 22V12" />
                            <path d="m17 13 5 5m-5 0 5-5" />
                          </svg>
                        </div>
                        <div className="space-y-2 text-center">
                          <h3 className="text-lg font-medium">Ainda não há produtos cadastrados <span className="text-muted-foreground">:(</span></h3>
                          <p className="text-sm text-muted-foreground">
                            Comece cadastrando seu primeiro produto clicando no botão acima.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Tem certeza que deseja excluir o produto <strong>{productToDelete?.title}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
            >
              {deletingId === productToDelete?.id ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewImage && (
        <ImagePreviewModal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          alt={previewImage.alt}
        />
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload } from "lucide-react"
import { getProduto, updateProduto, uploadProdutoImage, deleteProdutoImage } from "@/services/produtoService"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    valor: "",
    tipoTamanho: "anel",
    tamanho: "",
    status: "ativo",
    foto: null as File | null,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imagemRemovida, setImagemRemovida] = useState(false)

  // Estado para armazenar a URL original da imagem
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)

  // Função para normalizar o tamanho ao carregar do banco de dados
  const normalizeTamanho = (tamanho: string | null) => {
    if (!tamanho) return ""
    
    // Verifica se é um número
    const num = parseFloat(tamanho)
    if (isNaN(num)) return tamanho
    
    // Se for menor que 14, retorna como "menos-14"
    if (num < 14) return `custom-menos-${tamanho}`
    
    // Se for maior que 22, retorna como "mais-22"
    if (num > 22) return `custom-mais-${tamanho}`
    
    // Se estiver entre 14 e 22, retorna o número como string
    return tamanho
  }

  // Carrega os dados do produto
  useEffect(() => {
    const loadProduto = async () => {
      if (!params?.id || !user?.empresa) return
      
      try {
        setIsLoading(true)
        const produto = await getProduto(params.id as string)
        
        if (produto && produto.empresa === user.empresa) {
          setFormData({
            titulo: produto.titulo || "",
            descricao: produto.descricao || "",
            valor: produto.valor || "",
            tipoTamanho: produto.tipo_tamanho || "anel",
            tamanho: normalizeTamanho(produto.tamanho || ""),
            status: produto.status === "ATIVADO" ? "ativo" : "inativo",
            foto: null,
          })
          
          if (produto.url_foto) {
            setPreviewUrl(produto.url_foto)
            setOriginalImageUrl(produto.url_foto) // Armazena a URL original da imagem
          }
        } else {
          toast.error("Produto não encontrado")
          router.push("/dashboard/produtos")
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        toast.error("Erro ao carregar os dados do produto")
        router.push("/dashboard/produtos")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProduto()
  }, [params.id, user?.empresa])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, foto: file }))
    
    // Se o usuário selecionou um arquivo, define que a imagem não foi removida
    if (file) {
      setImagemRemovida(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // Se não há arquivo e havia uma imagem antes, mantém a URL para poder remover depois
      if (!previewUrl) {
        setPreviewUrl(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.empresa) {
      toast.error("Usuário não autenticado ou sem empresa")
      return
    }

    if (!formData.titulo || !formData.descricao || !formData.valor || !formData.tamanho) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsLoading(true)
    try {
      // Verifica se a imagem foi alterada ou removida
      let imageUrl: string | null = null
      const imagemFoiAlterada = formData.foto !== null
      const imagemFoiRemovida = imagemRemovida || (!formData.foto && previewUrl)
      
      // Se a imagem foi removida ou alterada, remove a imagem antiga se existir
      if ((imagemFoiRemovida || imagemFoiAlterada) && originalImageUrl) {
        try {
          await deleteProdutoImage(originalImageUrl)
          console.log('Imagem antiga removida com sucesso')
        } catch (error) {
          console.error('Erro ao remover imagem antiga:', error)
          // Não interrompe o fluxo se falhar em remover a imagem antiga
        }
      }
      
      // Se uma nova imagem foi fornecida, faz o upload
      if (imagemFoiAlterada && formData.foto) {
        imageUrl = await uploadProdutoImage(formData.foto, user.empresa)
      } else if (!imagemFoiRemovida) {
        // Se a imagem não foi alterada nem removida, mantém a URL original
        imageUrl = originalImageUrl || null
      }

      // Prepara os dados para atualização
      const produtoData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        valor: formData.valor,
        tipo_tamanho: formData.tipoTamanho,
        tamanho: formData.tamanho,
        status: formData.status === "ativo" ? "ATIVADO" : "DESATIVADO",
        url_foto: imageUrl,
      }

      // Atualiza o produto
      await updateProduto(params.id as string, produtoData)
      
      toast.success("Produto atualizado com sucesso!")
      router.push("/dashboard/produtos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      toast.error("Erro ao atualizar produto. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/produtos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
          <p className="text-muted-foreground">Atualize as informações do produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Informações Básicas</CardTitle>
              <CardDescription>Detalhes principais do produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Produto</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Anel de Diamante"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o produto detalhadamente"
                  className="min-h-[120px]"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoTamanho">Tipo de Tamanho</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={formData.tipoTamanho}
                      onValueChange={(value) => setFormData({ ...formData, tipoTamanho: value, tamanho: "" })}
                    >
                      <SelectTrigger id="tipoTamanho">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anel">Anel</SelectItem>
                        <SelectItem value="cm">Centímetros</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="relative">
                      <Input
                        id="tamanho"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="99"
                        step={formData.tipoTamanho === "anel" ? "1" : "0.1"}
                        placeholder={formData.tipoTamanho === "anel" ? "Ex: 16" : "Ex: 5.5"}
                        value={formData.tamanho}
                        onChange={(e) => {
                          // Remove qualquer caractere não numérico, excunto ponto decimal
                          let value = e.target.value.replace(/[^0-9.]/g, '');
                          
                          // Garante que não há mais de um ponto decimal
                          const decimalCount = value.split('.').length - 1;
                          if (decimalCount > 1) {
                            value = value.replace(/\.+$/, '');
                          }
                          
                          // Limita para 2 dígitos antes do ponto (se houver)
                          const parts = value.split('.');
                          if (parts[0].length > 2) {
                            parts[0] = parts[0].slice(0, 2);
                            value = parts.join('.');
                          }
                          
                          // Limita para 1 casa decimal para centímetros
                          if (formData.tipoTamanho === "cm" && parts[1] && parts[1].length > 1) {
                            parts[1] = parts[1].slice(0, 1);
                            value = parts.join('.');
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            tamanho: value
                          }));
                        }}
                        className="w-full"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {formData.tipoTamanho === "anel" ? "nº" : "cm"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Imagem do Produto</CardTitle>
                <CardDescription>Adicione uma foto do produto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 h-[200px] bg-slate-50 dark:bg-slate-800">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => {
                          // Se a imagem já estava salva (não é uma prévia de upload), marca para remoção
                          if (previewUrl && !previewUrl.startsWith('data:')) {
                            setImagemRemovida(true)
                          }
                          setPreviewUrl(null)
                          setFormData(prev => ({ ...prev, foto: null }))
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium mb-1">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG (max. 2MB)</p>
                      <Input id="foto" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-4"
                        onClick={() => document.getElementById("foto")?.click()}
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Configurações</CardTitle>
                <CardDescription>Defina o status e visibilidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="status">Status do Produto</Label>
                    <p className="text-sm text-muted-foreground">Defina se o produto está ativo ou inativo</p>
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status" className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/produtos">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Atualizar Produto"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

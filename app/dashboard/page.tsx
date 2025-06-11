'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Users, Package, CreditCard, TrendingUp, ArrowDownRight, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { countClientes, getClientesRecentes, type Cliente } from "@/services/clienteService"
import { countProdutos, getProdutos } from "@/services/produtoService"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [totalClientes, setTotalClientes] = useState<number | null>(null)
  const [totalProdutos, setTotalProdutos] = useState<number | null>(null)
  const [clientesRecentes, setClientesRecentes] = useState<Cliente[]>([])
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([])
  const [paginaAtualClientes, setPaginaAtualClientes] = useState(0)
  const itensPorPagina = 5
  const [totalPaginasClientes, setTotalPaginasClientes] = useState(0)
  
  // Estados para produtos
  const [todosProdutos, setTodosProdutos] = useState<any[]>([])
  const [produtosExibidos, setProdutosExibidos] = useState<any[]>([])
  const [paginaAtualProdutos, setPaginaAtualProdutos] = useState(0)
  const [totalPaginasProdutos, setTotalPaginasProdutos] = useState(0)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [loadingRecentes, setLoadingRecentes] = useState(true)
  const [loadingProdutosLista, setLoadingProdutosLista] = useState(true)
  const [errorClientes, setErrorClientes] = useState<string | null>(null)
  const [errorProdutos, setErrorProdutos] = useState<string | null>(null)
  const [errorRecentes, setErrorRecentes] = useState<string | null>(null)
  const [errorProdutosLista, setErrorProdutosLista] = useState<string | null>(null)

  // Funções de navegação de clientes
  const irParaProximaPaginaClientes = () => {
    const novaPagina = paginaAtualClientes + 1
    const inicio = novaPagina * itensPorPagina
    const fim = (novaPagina + 1) * itensPorPagina
    setClientesRecentes(todosClientes.slice(inicio, fim))
    setPaginaAtualClientes(novaPagina)
  }

  const irParaPaginaAnteriorClientes = () => {
    const novaPagina = paginaAtualClientes - 1
    const inicio = novaPagina * itensPorPagina
    const fim = (novaPagina + 1) * itensPorPagina
    setClientesRecentes(todosClientes.slice(inicio, fim))
    setPaginaAtualClientes(novaPagina)
  }

  // Funções de navegação de produtos
  const irParaProximaPaginaProdutos = () => {
    const novaPagina = paginaAtualProdutos + 1
    const inicio = novaPagina * itensPorPagina
    const fim = (novaPagina + 1) * itensPorPagina
    setProdutosExibidos(todosProdutos.slice(inicio, fim))
    setPaginaAtualProdutos(novaPagina)
  }

  const irParaPaginaAnteriorProdutos = () => {
    const novaPagina = paginaAtualProdutos - 1
    const inicio = novaPagina * itensPorPagina
    const fim = (novaPagina + 1) * itensPorPagina
    setProdutosExibidos(todosProdutos.slice(inicio, fim))
    setPaginaAtualProdutos(novaPagina)
  }

  // Verifica se há mais páginas
  const temProximaPaginaClientes = paginaAtualClientes < totalPaginasClientes - 1
  const temPaginaAnteriorClientes = paginaAtualClientes > 0
  
  const temProximaPaginaProdutos = paginaAtualProdutos < totalPaginasProdutos - 1
  const temPaginaAnteriorProdutos = paginaAtualProdutos > 0

  // Função para formatar a data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    const agora = new Date()
    const diffEmSegundos = Math.floor((agora.getTime() - data.getTime()) / 1000)
    
    if (diffEmSegundos < 60) {
      return 'Agora mesmo'
    } else if (diffEmSegundos < 3600) {
      const minutos = Math.floor(diffEmSegundos / 60)
      return `Há ${minutos} minuto${minutos > 1 ? 's' : ''}`
    } else if (diffEmSegundos < 86400) {
      const horas = Math.floor(diffEmSegundos / 3600)
      return `Há ${horas} hora${horas > 1 ? 's' : ''}`
    } else {
      const dias = Math.floor(diffEmSegundos / 86400)
      return `Há ${dias} dia${dias > 1 ? 's' : ''}`
    }
  }

  // Carregar contagem de clientes
  useEffect(() => {
    async function loadClientes() {
      if (!user?.empresa) return

      try {
        setLoadingClientes(true)
        const count = await countClientes(user.empresa)
        setTotalClientes(count)
        setErrorClientes(null)
      } catch (err) {
        console.error('Erro ao carregar contagem de clientes:', err)
        setErrorClientes('Erro ao carregar contagem de clientes')
      } finally {
        setLoadingClientes(false)
      }
    }

    // Carregar contagem de produtos
    async function loadProdutos() {
      if (!user?.empresa) return
      
      try {
        setLoadingProdutos(true)
        const count = await countProdutos(user.empresa)
        setTotalProdutos(count)
        setErrorProdutos(null)
      } catch (err) {
        console.error('Erro ao carregar contagem de produtos:', err)
        setErrorProdutos('Erro ao carregar contagem de produtos')
      } finally {
        setLoadingProdutos(false)
      }
    }

    loadClientes()
    loadProdutos()
  }, [user?.empresa])

  // Carregar lista de produtos
  useEffect(() => {
    async function loadProdutos() {
      if (!user?.empresa) return
      
      try {
        setLoadingProdutosLista(true)
        const produtos = await getProdutos(user.empresa)
        // Ordena do mais recente para o mais antigo
        const produtosOrdenados = [...produtos].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setTodosProdutos(produtosOrdenados)
        // Define a primeira página de produtos
        setProdutosExibidos(produtosOrdenados.slice(0, itensPorPagina))
        setTotalPaginasProdutos(Math.ceil(produtosOrdenados.length / itensPorPagina))
        setErrorProdutosLista(null)
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
        setErrorProdutosLista('Erro ao carregar a lista de produtos')
      } finally {
        setLoadingProdutosLista(false)
      }
    }

    loadProdutos()
  }, [user?.empresa])

  // Carregar clientes recentes
  useEffect(() => {
    async function loadClientesRecentes() {
      if (!user?.empresa) return
      
      try {
        setLoadingRecentes(true)
        // Busca todos os clientes ordenados por data de criação
        const clientes = await getClientesRecentes(user.empresa, 100) // Busca mais itens para paginação
        setTodosClientes(clientes)
        // Define os itens da primeira página
        setClientesRecentes(clientes.slice(0, itensPorPagina))
        setPaginaAtualClientes(0)
        setTotalPaginasClientes(Math.ceil(clientes.length / itensPorPagina))
        setErrorRecentes(null)
      } catch (err) {
        console.error('Erro ao carregar clientes recentes:', err)
        setErrorRecentes('Erro ao carregar clientes recentes')
      } finally {
        setLoadingRecentes(false)
      }
    }

    loadClientesRecentes()
  }, [user?.empresa])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao seu painel administrativo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription className="text-violet-100">Vendas Hoje</CardDescription>
            <CardTitle className="text-2xl flex justify-between items-center">
              R$ 1.240,50
              <TrendingUp className="h-5 w-5 text-violet-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-300" />
              <span className="text-green-300 font-medium">+12%</span>
              <span className="ml-1 text-violet-200">desde ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-100">Clientes</CardDescription>
            <CardTitle className="text-2xl flex justify-between items-center">
              {loadingClientes ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                </div>
              ) : errorClientes ? (
                <span className="text-sm text-amber-200">Erro ao carregar</span>
              ) : (
                totalClientes?.toLocaleString('pt-BR') || '0'
              )}
              <Users className="h-5 w-5 text-amber-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-300" />
              <span className="text-green-300 font-medium">Total</span>
              <span className="ml-1 text-amber-200">de clientes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription className="text-teal-100">Produtos</CardDescription>
            <CardTitle className="text-2xl flex justify-between items-center">
              {loadingProdutos ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                </div>
              ) : errorProdutos ? (
                <span className="text-sm text-teal-200">Erro ao carregar</span>
              ) : (
                totalProdutos?.toLocaleString('pt-BR') || '0'
              )}
              <Package className="h-5 w-5 text-teal-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-300" />
              <span className="text-green-300 font-medium">Total</span>
              <span className="ml-1 text-teal-200">de produtos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-400 to-pink-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription className="text-rose-100">Receita Mensal</CardDescription>
            <CardTitle className="text-2xl flex justify-between items-center">
              R$ 24.980,00
              <CreditCard className="h-5 w-5 text-rose-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-300" />
              <span className="text-red-300 font-medium">-2.5%</span>
              <span className="ml-1 text-rose-200">desde o mês passado</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Clientes Recentes</CardTitle>
            <CardDescription>Lista de clientes recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecentes ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              </div>
            ) : errorRecentes ? (
              <div className="text-center text-red-500 py-4">
                {errorRecentes}
              </div>
            ) : (
              <div className="space-y-4">
                {clientesRecentes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum cliente recente</p>
                ) : (
                  clientesRecentes.map((cliente) => (
                    <div key={cliente.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md bg-violet-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium">{cliente.nome || 'Cliente sem nome'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatarData(cliente.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {cliente.whatsapp || 'Sem telefone'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cliente.id_campanha ? `Campanha: ${cliente.id_campanha}` : 'Sem campanha'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={irParaPaginaAnteriorClientes}
                className={`flex items-center text-sm font-medium ${temPaginaAnteriorClientes ? 'text-amber-600 hover:text-amber-700' : 'text-muted-foreground cursor-not-allowed'}`}
                disabled={!temPaginaAnteriorClientes || loadingRecentes}
              >
                {loadingRecentes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Lista anterior
                  </>
                )}
              </button>
              
              <span className="text-sm text-muted-foreground">
                Página {paginaAtualClientes + 1} de {totalPaginasClientes || 1}
              </span>
              
              <button
                onClick={irParaProximaPaginaClientes}
                className={`flex items-center text-sm font-medium ${temProximaPaginaClientes ? 'text-amber-600 hover:text-amber-700' : 'text-muted-foreground cursor-not-allowed'}`}
                disabled={!temProximaPaginaClientes || loadingRecentes}
              >
                {loadingRecentes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  </>
                ) : (
                  <>
                    Próxima lista
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Produtos Cadastrados</CardTitle>
            <CardDescription>Lista de produtos cadastrados (mais recentes primeiro)</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProdutosLista ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              </div>
            ) : errorProdutosLista ? (
              <div className="text-center text-red-500 py-4">
                {errorProdutosLista}
              </div>
            ) : (
              <div className="space-y-4">
                {produtosExibidos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum produto cadastrado</p>
                ) : (
                  produtosExibidos.map((produto: any) => (
                    <div key={produto.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md bg-violet-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium">{produto.titulo || 'Produto sem nome'}</p>
                          <p className="text-sm text-muted-foreground">
                            {produto.descricao ? `${produto.descricao.substring(0, 30)}${produto.descricao.length > 30 ? '...' : ''}` : 'Sem descrição'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {produto.valor ? `R$ ${Number(produto.valor).toFixed(2).replace('.', ',')}` : 'Preço não informado'}
                        </p>
                        <div className="flex items-center justify-end">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                            produto.status === 'ATIVADO' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-xs text-muted-foreground">
                            {produto.status === 'ATIVADO' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Navegação de páginas para produtos - Só mostra se houver mais de 5 itens */}
                {todosProdutos.length > 5 && (
                  <div className="flex justify-between items-center mt-4 pt-2 border-t">
                    <button
                      onClick={irParaPaginaAnteriorProdutos}
                      className={`flex items-center text-sm font-medium ${temPaginaAnteriorProdutos ? 'text-amber-600 hover:text-amber-700' : 'text-muted-foreground cursor-not-allowed'}`}
                      disabled={!temPaginaAnteriorProdutos || loadingProdutosLista}
                    >
                      {loadingProdutosLista ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </>
                      )}
                    </button>
                    
                    <span className="text-sm text-muted-foreground">
                      Página {paginaAtualProdutos + 1} de {totalPaginasProdutos || 1}
                    </span>
                    
                    <button
                      onClick={irParaProximaPaginaProdutos}
                      className={`flex items-center text-sm font-medium ${temProximaPaginaProdutos ? 'text-amber-600 hover:text-amber-700' : 'text-muted-foreground cursor-not-allowed'}`}
                      disabled={!temProximaPaginaProdutos || loadingProdutosLista}
                    >
                      {loadingProdutosLista ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          Próxima
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

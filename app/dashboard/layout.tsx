"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Users, Settings, LogOut, Menu, Home, Bell, Search, MessageSquare, Sun, Moon, Laptop, HelpCircle, Calendar, BarChart3, Clock, Zap, FileText, AlertCircle, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/hooks/useNotifications"
import { useTheme } from "next-themes"
import AuthGuard from "@/components/AuthGuard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Produtos", href: "/dashboard/produtos", icon: Package },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageSquare },
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, signOut } = useAuth()
  const { notifications, loading, error, markAsRead, getUnreadCount } = useNotifications()
  const { theme, setTheme } = useTheme()

  // Função para lidar com o logout
  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      }>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Sidebar para desktop */}
        <div
          className={cn(
            "hidden md:flex flex-col w-64 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "md:w-64" : "md:w-20",
          )}
        >
          <div className="flex flex-col h-full bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-700 text-white rounded-r-3xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between h-16 px-4">
              <div className={cn("flex items-center", !isSidebarOpen && "justify-center w-full")}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                {isSidebarOpen && <span className="ml-3 font-bold text-lg">Praise Store</span>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-white/20"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-lg transition-all",
                      pathname === item.href
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                      !isSidebarOpen && "justify-center",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all",
                  !isSidebarOpen && "justify-center",
                )}
              >
                <LogOut className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3">Sair</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar móvel */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-700 text-white"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span className="ml-3 font-bold text-lg">Praise Store</span>
              </div>
            </div>
            <div className="py-4 px-3">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-lg transition-all",
                      pathname === item.href
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
            <div className="flex items-center justify-between px-4 py-2 md:px-6">
              <div className="hidden md:flex">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  {pathname === "/dashboard" && "Dashboard"}
                  {pathname === "/dashboard/produtos" && "Produtos"}
                  {pathname === "/dashboard/clientes" && "Clientes"}
                  {pathname === "/dashboard/whatsapp" && "WhatsApp"}
                  {pathname === "/dashboard/configuracoes" && "Configurações"}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                {/* Seletor de tema */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 text-slate-600" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem 
                      onClick={() => setTheme('light')}
                      className={`flex items-center ${theme === 'light' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : ''}`}
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTheme('dark')}
                      className={`flex items-center ${theme === 'dark' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : ''}`}
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Escuro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTheme('system')}
                      className={`flex items-center ${theme === 'system' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : ''}`}
                    >
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>Sistema</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Notificações */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      {getUnreadCount() > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 rounded-t-md">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">Notificações</h3>
                        {getUnreadCount() > 0 && (
                          <span className="bg-white text-violet-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {getUnreadCount()} {getUnreadCount() === 1 ? 'nova' : 'novas'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loading ? (
                        <div className="p-8 flex justify-center items-center">
                          <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                        </div>
                      ) : error ? (
                        <div className="p-4 text-center text-sm text-red-500">
                          {error}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                          Nenhuma notificação encontrada.
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${notification.status_leitura === 'nao' ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex gap-3">
                              <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                <Bell className="h-5 w-5 text-violet-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{notification.texto}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 text-center border-t">
                      <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 w-full">
                        Ver todas as notificações
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Avatar e menu do usuário */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer h-9 w-9 hover:ring-2 hover:ring-violet-500 transition-all">
                      {/* Removido o AvatarImage para mostrar sempre a letra inicial */}
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-medium">
                        {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2 border-b">
                      <Avatar className="h-8 w-8">
                        {/* Removido o AvatarImage para mostrar sempre a letra inicial */}
                        <AvatarFallback className="bg-violet-500 text-white text-sm font-medium">
                          {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user?.nome || 'Usuário'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'sem email'}</p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/perfil" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/configuracoes" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 dark:text-rose-400 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Conteúdo da página */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900">{children}</main>
        </div>
      </div>
      </Suspense>
    </AuthGuard>
  )
}

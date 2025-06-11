'use client'

import { MessageSquare, QrCode, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { getBotByToken } from "@/services/botService"
import Image from "next/image"

export function WhatsAppContent() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [bot, setBot] = useState<{
    qrcode: string | null
    status: string | null
    numero: string | null
    nome: string | null
  }>({
    qrcode: null,
    status: null,
    numero: null,
    nome: null
  })

  // Carrega as informações do bot ao montar o componente
  useEffect(() => {
    const loadBot = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Usa o ID do usuário como token para buscar o bot correspondente
        const botData = await getBotByToken(user.id);
        
        if (botData) {
          console.log('Dados do bot carregados:', botData);
          setBot({
            qrcode: botData.qrcode,
            status: botData.status,
            numero: botData.numero,
            nome: botData.nome || 'WhatsApp Bot'
          });
        } else {
          console.log('Nenhum bot encontrado para o usuário atual');
          setBot(prev => ({
            ...prev,
            status: 'DESCONECTADO'
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar informações do bot:', error);
        toast.error('Erro ao carregar informações do WhatsApp');
      } finally {
        setIsLoading(false);
      }
    };

    loadBot();
    
    // Atualiza a cada 5 segundos para pegar o QR Code atualizado
    const interval = setInterval(loadBot, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleGenerateQRCode = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepara os dados do usuário e do bot para enviar no corpo da requisição
      const requestBody = {
        action: 'generate_qrcode',
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.nome,
          level: user.nivel,
          company: user.empresa,
          permissions: user.permissoes
        },
        bot: {
          id: user.id,
          name: user.nome || 'Usuário',
          instance: user.id
        }
      };

      // Faz a chamada para o webhook
      const response = await fetch('https://praisewhk.praisesistemas.uk/webhook/lalunna/qrcode-updated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao gerar QR Code');
      }
      
      // Atualiza o status para mostrar que está aguardando o QR Code
      setBot(prev => ({
        ...prev,
        status: 'AGUARDANDO_QRCODE',
        qrcode: null // Limpa o QR Code anterior se existir
      }));
      
      toast.success('Solicitação de QR Code enviada com sucesso!');
      
      // O QR Code será atualizado automaticamente pelo intervalo configurado no useEffect
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao gerar QR Code');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-emerald-600" />
            WhatsApp
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas mensagens e integrações do WhatsApp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Conexão */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Conexão WhatsApp</h2>
          
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 flex flex-col items-center justify-center min-h-[200px] bg-muted/30">
              {bot.status === 'open' ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-48 h-48 flex items-center justify-center mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <div className="h-24 w-24 text-emerald-600 dark:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-green-600 font-medium text-center text-lg">
                    Bot conectado!
                  </p>
                </div>
              ) : bot.status === 'close' ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-48 h-48 flex items-center justify-center mb-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <div className="h-24 w-24 text-red-600 dark:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-red-600 font-medium text-center text-lg">
                    Bot não conectado!
                  </p>
                </div>
              ) : bot.qrcode ? (
                <>
                  <div className="mb-4 p-2 bg-white rounded">
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Image
                        src={bot.qrcode?.startsWith('data:image/') ? bot.qrcode : `data:image/png;base64,${bot.qrcode || ''}`}
                        alt="QR Code para conexão"
                        width={192}
                        height={192}
                        className="object-contain w-full h-full"
                        unoptimized
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', e);
                          // Tenta carregar como base64 puro se o formato estiver incorreto
                          if (bot.qrcode && !bot.qrcode.startsWith('data:image/')) {
                            const img = e.target as HTMLImageElement;
                            img.src = `data:image/png;base64,${bot.qrcode}`;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie este QR Code com o WhatsApp Web para conectar
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    {bot.status === 'AGUARDANDO_QRCODE' 
                      ? 'Aguardando geração do QR Code...' 
                      : 'Gere um código QR para conectar sua conta do WhatsApp'}
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleGenerateQRCode}
              className="w-full mt-4"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  {bot.qrcode ? 'Atualizar QR Code' : 'Gerar QR Code'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Card de Status */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Status da Conexão</h2>
          <div className="space-y-4">
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              {bot.status === 'open' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <div className="h-6 w-6 text-emerald-600 dark:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4">
                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-emerald-700 dark:text-emerald-400">Conectado</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">WhatsApp Bot está online e pronto para uso</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                      <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                      Online
                    </span>
                  </div>
                </div>
              ) : bot.status === 'close' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                      <div className="h-6 w-6 text-red-600 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">Desconectado</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">WhatsApp Bot está offline no momento</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-500/20">
                      <span className="mr-1 h-2 w-2 rounded-full bg-red-500"></span>
                      Offline
                    </span>
                  </div>
                </div>
              ) : bot.status === 'AGUARDANDO_QRCODE' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <div className="h-6 w-6 text-amber-600 dark:text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4">
                        <div className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-amber-700 dark:text-amber-400">Aguardando</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Aguardando leitura do QR Code</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20">
                      <span className="mr-1 h-2 w-2 rounded-full bg-amber-500"></span>
                      Pendente
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-6 w-6 text-slate-600 dark:text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300">Desconectado</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Gere um QR Code para conectar</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-500/20">
                      <span className="mr-1 h-2 w-2 rounded-full bg-slate-500"></span>
                      Inativo
                    </span>
                  </div>
                </div>
              )}
              
              {/* Decoração visual */}
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 blur-xl"></div>
              {bot.status === 'open' && (
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 blur-xl"></div>
              )}
              {bot.status === 'close' && (
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-500/0 blur-xl"></div>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h3 className="font-medium text-foreground">Como conectar:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique em "Gerar QR Code"</li>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em ⋮ → Dispositivos conectados → Vincular um dispositivo</li>
                <li>Aponte a câmera para o QR Code acima</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

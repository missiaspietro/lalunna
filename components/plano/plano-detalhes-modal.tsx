'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlanoDados } from "@/services/planoService"
import { formatarData, formatarMoeda } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CreditCard, CheckCircle, XCircle } from "lucide-react"

interface PlanoDetalhesModalProps {
  isOpen: boolean
  onClose: () => void
  planoDados: PlanoDados | null
}

export function PlanoDetalhesModal({ isOpen, onClose, planoDados }: PlanoDetalhesModalProps) {
  if (!planoDados) return null

  // Verificar o status de forma mais robusta
  const isAtivo = planoDados.status?.toLowerCase() === 'ativo' || 
    planoDados.status?.toLowerCase() === 'active' || 
    planoDados.status?.toLowerCase() === 'ativado'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Plano</DialogTitle>
          <DialogDescription>
            Informações sobre seu plano atual
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Status:</span>
            <Badge variant={isAtivo ? "outline" : "destructive"} className={`flex items-center gap-1 ${isAtivo ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}>
              {isAtivo ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span>Ativo</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  <span>Inativo</span>
                </>
              )}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Mensalidade:</span>
            <span>{planoDados.valor ? formatarMoeda(planoDados.valor) : 'Não informado'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Vencimento:</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {planoDados.dia_de_Vencimento || 'Não informado'}
            </span>
          </div>

          {/* Forma de pagamento removida conforme solicitado */}

          {planoDados.ultimo_envio && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Último Envio:</span>
              <span>{formatarData(planoDados.ultimo_envio)}</span>
            </div>
          )}

          {planoDados.servicoProdutos && (
            <div className="flex flex-col gap-1">
              <span className="font-medium">Serviços/Produtos:</span>
              <span className="text-sm text-muted-foreground">{planoDados.servicoProdutos}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

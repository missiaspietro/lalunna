'use client'

import { supabase } from '@/lib/supabase/client'

// Tipos baseados na estrutura da tabela ger_clientes_praise
export interface PlanoDados {
  id: number
  data_criacao: string
  rede: string | null
  loja: string | null
  subrede: string | null
  valor: number | null
  dia_de_Vencimento: string | null
  status: string | null
  ultimo_envio: string | null
  id_asaas: string | null
  whatsapp: string | null
  cnpj: string | null
  email: string | null
  mesDeEnvio: string | null
  formaPagamento: string | null
  servicoProdutos: string | null
  pix: string | null
  quemSomos: string | null
  quemVoce: string | null
  saudacao: string | null
  horaFunc: string | null
  endereco: string | null
  infDesc: string | null
  raioEntrega: string | null
  contrato: string | null
  assinaturaContrato: string | null
  senhaContrato: string | null
  sugestaoMudanca: string | null
  urlFoto: string | null
  tokenAssinatura: string | null
}

// Função para obter os dados do plano pelo nome da rede (empresa)
export async function getPlanoByRede(rede: string): Promise<PlanoDados | null> {
  try {
    console.log('[DEBUG] [PLANO SERVICE] Buscando plano para rede:', rede);
    
    if (!supabase) {
      console.error('[DEBUG] [PLANO SERVICE] Cliente do Supabase não disponível');
      throw new Error('Cliente do Supabase não está disponível');
    }
    
    console.log('[DEBUG] [PLANO SERVICE] Consultando tabela ger_clientes_praise para rede:', rede);
    
    // Consulta direta à tabela ger_clientes_praise
    const { data, error } = await supabase
      .from('ger_clientes_praise')
      .select('*')
      .eq('rede', rede)
      .maybeSingle(); // Usa maybeSingle em vez de single para evitar erro se não encontrar

    if (error) {
      console.error('[DEBUG] [PLANO SERVICE] Erro ao buscar plano:', error);
      console.error('[DEBUG] [PLANO SERVICE] Código:', error.code);
      console.error('[DEBUG] [PLANO SERVICE] Mensagem:', error.message);
      throw new Error(`Erro ao buscar plano: ${error.message}`);
    }

    console.log('[DEBUG] [PLANO SERVICE] Plano encontrado:', data);
    return data as PlanoDados;
  } catch (error) {
    console.error('[DEBUG] [PLANO SERVICE] Erro ao buscar plano:', error);
    throw error;
  }
}

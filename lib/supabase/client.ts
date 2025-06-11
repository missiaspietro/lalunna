import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verifica se as variáveis de ambiente estão definidas
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.error('[SUPABASE] Erro: Variáveis de ambiente não configuradas corretamente')
}

// Cria uma única instância do cliente Supabase
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Função para obter a instância única do cliente
function getSupabaseClient() {
  // Se já existe uma instância, retorna ela
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // Cria uma nova instância apenas no navegador
  if (typeof window !== 'undefined') {
    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false, // Desabilita o armazenamento de sessão do Supabase
        detectSessionInUrl: false, // Desabilita detecção de sessão na URL
      },
      global: {
        headers: { 'x-application-name': 'lalunna-admin-panel' },
      },
    })
  }

  return supabaseClient;
}

// Cria o cliente apenas uma vez no carregamento do módulo
const supabase = getSupabaseClient()

// Exporta o cliente diretamente
export { supabase }

// Exporta a função createClient para compatibilidade com código existente
export function createClient() {
  return getSupabaseClient()
}

// Exporta o tipo do cliente para ser usado em outros lugares
export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

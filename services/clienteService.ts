'use client'

import { supabase } from '@/lib/supabase/client'

// Tipos baseados na estrutura da tabela lalunna_clientes
export interface Cliente {
  id: number
  created_at: string
  nome: string | null
  whatsapp: string | null
  empresa: string | null
  id_campanha: string | null
}

// Tipos para criar/atualizar um cliente
export type ClienteInsert = Omit<Cliente, 'id' | 'created_at' | 'id_campanha'>
export type ClienteUpdate = Partial<ClienteInsert>

// URL base da API do Supabase
const API_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Tipos para erros da API
type ApiError = {
  message: string;
  status?: number;
  details?: any;
}

// Constantes de configuração
const REQUEST_TIMEOUT = 10000 // 10 segundos

// Headers padrão para as requisições
const getHeaders = () => ({
  'apikey': API_KEY || '',
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
})

// Função para fazer requisições com timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new Error('A requisição excedeu o tempo limite')
    }
    throw error
  }
}

// Validação de dados de entrada
const validateCliente = (cliente: Partial<ClienteInsert>): void => {
  if (cliente.nome && cliente.nome.length < 2) {
    throw new Error('O nome deve ter pelo menos 2 caracteres')
  }
  
  if (cliente.whatsapp) {
    const digitsOnly = cliente.whatsapp.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      throw new Error('Número de WhatsApp inválido')
    }
  }
  
  if (cliente.empresa && cliente.empresa.length < 2) {
    throw new Error('O nome da empresa deve ter pelo menos 2 caracteres')
  }
}

// Tratamento de erros da API
const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
  let errorData
  try {
    errorData = await response.json()
    console.error('[CLIENTE SERVICE] Erro na resposta da API:', errorData)
  } catch (e) {
    // Se não conseguir parsear o JSON de erro
    console.error('[CLIENTE SERVICE] Erro ao processar resposta da API:', e)
    throw new Error(defaultMessage)
  }
  
  const errorMessage = errorData?.message || defaultMessage
  const error: ApiError = new Error(errorMessage)
  error.status = response.status
  error.details = errorData
  
  throw error
}

export async function countClientes(empresa: string): Promise<number> {
  try {
    console.log('[DEBUG] [CLIENTE SERVICE] Contando clientes para empresa:', empresa);
    
    if (!supabase) {
      console.error('[DEBUG] [CLIENTE SERVICE] Cliente do Supabase não disponível');
      throw new Error('Cliente do Supabase não está disponível');
    }
    
    console.log('[DEBUG] [CLIENTE SERVICE] Consultando tabela lalunna_clientes para empresa:', empresa);
    
    // Consulta direta à tabela lalunna_clientes
    const { count, error } = await supabase
      .from('lalunna_clientes')
      .select('*', { count: 'exact', head: true })
      .eq('empresa', empresa);

    if (error) {
      console.error('[DEBUG] [CLIENTE SERVICE] Erro ao contar clientes:', error);
      console.error('[DEBUG] [CLIENTE SERVICE] Código:', error.code);
      console.error('[DEBUG] [CLIENTE SERVICE] Mensagem:', error.message);
      throw new Error(`Erro ao contar clientes: ${error.message}`);
    }

    console.log('[DEBUG] [CLIENTE SERVICE] Total de clientes encontrados:', count);
    return count || 0;
  } catch (error) {
    console.error('[DEBUG] [CLIENTE SERVICE] Erro ao contar clientes:', error);
    throw error;
  }
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de cliente inválido')
  }
  
  console.log(`[CLIENTE SERVICE] Buscando cliente ID: ${id}`)
  
  try {
    const response = await fetchWithTimeout(
      `${API_URL}/lalunna_clientes?id=eq.${id}`,
      {
        method: 'GET',
        headers: getHeaders(),
        next: { revalidate: 0 } // Sempre buscar do servidor
      }
    )

    if (!response.ok) {
      return handleApiError(response, 'Erro ao buscar cliente')
    }

    const data = await response.json()
    console.log(`[CLIENTE SERVICE] Cliente encontrado:`, data[0] ? 'Sim' : 'Não')
    return data[0] as Cliente || null
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao buscar cliente:', error)
    throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar cliente')
  }
}

export async function getClientes(empresa: string): Promise<Cliente[]> {
  if (!empresa || typeof empresa !== 'string' || empresa.trim().length === 0) {
    throw new Error('Nome da empresa é obrigatório')
  }
  
  console.log('[CLIENTE SERVICE] Buscando clientes para empresa:', empresa)
  
  const url = new URL(`${API_URL}/lalunna_clientes`)
  url.searchParams.append('empresa', `eq.${empresa}`)
  url.searchParams.append('select', '*')

  try {
    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      return await handleApiError(response, 'Erro ao buscar clientes')
    }

    const data = await response.json()
    console.log('[CLIENTE SERVICE] Clientes encontrados:', data.length)
    return data
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao buscar clientes:', error)
    throw new Error('Erro ao buscar clientes. Tente novamente mais tarde.')
  }
}

export async function getClientesRecentes(empresa: string, limite: number = 10): Promise<Cliente[]> {
  const url = new URL(`${API_URL}/lalunna_clientes`)
  url.searchParams.append('empresa', `eq.${empresa}`)
  url.searchParams.append('select', '*')
  url.searchParams.append('order', 'created_at.desc')
  url.searchParams.append('limit', limite.toString())

  try {
    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      return await handleApiError(response, 'Erro ao buscar clientes recentes')
    }

    const data = await response.json()
    console.log(`[CLIENTE SERVICE] ${data.length} clientes recentes encontrados`)
    return data
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao buscar clientes recentes:', error)
    throw new Error('Erro ao buscar clientes recentes. Tente novamente mais tarde.')
  }
}

export async function createCliente(cliente: ClienteInsert): Promise<Cliente> {
  console.log('[CLIENTE SERVICE] Criando novo cliente:', cliente)
  
  try {
    // Valida os dados de entrada
    validateCliente(cliente)
    
    if (!cliente.empresa) {
      throw new Error('Empresa é obrigatória')
    }
    
    // Apenas os campos que existem na tabela
    const clienteData = {
      nome: cliente.nome?.trim() || null,
      whatsapp: cliente.whatsapp ? cliente.whatsapp.replace(/\D/g, '') : null,
      empresa: cliente.empresa.trim(),
      id_campanha: '35466767643567' // Valor padrão
    }

    console.log('[CLIENTE SERVICE] Dados para inserção:', clienteData)

    const response = await fetchWithTimeout(
      `${API_URL}/lalunna_clientes`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(clienteData)
      }
    )

    if (!response.ok) {
      return handleApiError(response, 'Erro ao criar cliente')
    }

    const [data] = await response.json()
    console.log('[CLIENTE SERVICE] Cliente criado com sucesso. ID:', data.id)
    return data as Cliente
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao criar cliente:', error)
    throw error instanceof Error ? error : new Error('Erro desconhecido ao criar cliente')
  }
}

export async function updateCliente(id: number, updates: ClienteUpdate): Promise<Cliente> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de cliente inválido')
  }
  
  console.log(`[CLIENTE SERVICE] Atualizando cliente ID ${id}:`, updates)
  
  try {
    // Valida os dados de atualização
    if (Object.keys(updates).length === 0) {
      throw new Error('Nenhum dado para atualizar')
    }
    
    // Valida os campos fornecidos
    validateCliente(updates as ClienteInsert)
    
    // Prepara os dados para atualização
    const updateData: Record<string, any> = {}
    
    if (updates.nome !== undefined) {
      updateData.nome = updates.nome?.trim() || null
    }
    
    if (updates.whatsapp !== undefined) {
      updateData.whatsapp = updates.whatsapp ? updates.whatsapp.replace(/\D/g, '') : null
    }
    
    if (updates.empresa !== undefined) {
      if (!updates.empresa || updates.empresa.trim().length === 0) {
        throw new Error('Empresa não pode ser vazia')
      }
      updateData.empresa = updates.empresa.trim()
    }

    console.log('[CLIENTE SERVICE] Dados para atualização:', updateData)

    const response = await fetchWithTimeout(
      `${API_URL}/lalunna_clientes?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      }
    )

    if (!response.ok) {
      return handleApiError(response, 'Erro ao atualizar cliente')
    }

    // Buscar o cliente atualizado para garantir que temos os dados mais recentes
    const updatedCliente = await getClienteById(id)
    if (!updatedCliente) {
      throw new Error('Cliente não encontrado após atualização')
    }
    
    console.log('[CLIENTE SERVICE] Cliente atualizado com sucesso. ID:', id)
    return updatedCliente
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao atualizar cliente:', error)
    throw error instanceof Error ? error : new Error('Erro desconhecido ao atualizar cliente')
  }
}

export async function deleteCliente(id: number): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de cliente inválido')
  }
  
  console.log(`[CLIENTE SERVICE] Excluindo cliente ID ${id}`)
  
  try {
    // Primeiro verifica se o cliente existe
    const cliente = await getClienteById(id)
    if (!cliente) {
      throw new Error('Cliente não encontrado')
    }
    
    const response = await fetchWithTimeout(
      `${API_URL}/lalunna_clientes?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: getHeaders()
      }
    )

    if (!response.ok) {
      return handleApiError(response, 'Erro ao excluir cliente')
    }

    console.log(`[CLIENTE SERVICE] Cliente ID ${id} excluído com sucesso`)
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao excluir cliente:', error)
    throw error instanceof Error ? error : new Error('Erro desconhecido ao excluir cliente')
  }
}

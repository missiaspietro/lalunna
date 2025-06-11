'use client'

// Tipos baseados na estrutura da tabela lalunna_clientes
export interface Cliente {
  id: number
  created_at: string
  nome: string | null
  whatsapp: string | null
  empresa: string | null
  id_campanha: string | null
  cidade?: string | null
}

// Tipos para criar/atualizar um cliente
export type ClienteInsert = Omit<Cliente, 'id' | 'created_at' | 'id_campanha'>
export type ClienteUpdate = Partial<ClienteInsert>

// Tipos para erros da API
type ApiError = {
  message: string;
  status?: number;
  details?: any;
}

// Constantes de configuração
const REQUEST_TIMEOUT = 10000 // 10 segundos

// Função para obter o token de autenticação atual
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Verificar primeiro no formato mais recente do Supabase
    const sbSession = localStorage.getItem('sb-auth-token');
    
    if (sbSession) {
      const parsedSession = JSON.parse(sbSession);
      return parsedSession?.access_token || null;
    }
    
    // Fallback para o formato antigo
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || null;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    return null;
  }
}

// Headers padrão para as requisições
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

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
    console.log('[CLIENTE SERVICE] Contando clientes para empresa:', empresa);
    
    // Verificar token para debug
    const token = getAuthToken();
    console.log('[CLIENTE SERVICE] Token disponível:', token ? 'Sim' : 'Não');
    
    // Obter headers com token de autenticação
    const headers = getHeaders();
    console.log('[CLIENTE SERVICE] Headers:', JSON.stringify(headers));
    
    // Fazer a requisição com timeout aumentado para debug
    const response = await fetchWithTimeout(
      `/api/clientes/count?empresa=${encodeURIComponent(empresa)}`,
      {
        method: 'GET',
        headers: headers
      },
      15000 // Aumentar timeout para 15 segundos durante debug
    );
    
    console.log('[CLIENTE SERVICE] Status da resposta:', response.status);
    
    if (!response.ok) {
      console.error('[CLIENTE SERVICE] Resposta não ok:', response.status, response.statusText);
      await handleApiError(response, 'Erro ao contar clientes');
    }
    
    const data = await response.json();
    console.log('[CLIENTE SERVICE] Dados recebidos:', data);
    return data.count || 0;
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao contar clientes:', error);
    // Retornar um valor padrão para evitar quebrar a interface
    return 0;
  }
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de cliente inválido')
  }
  
  console.log(`[CLIENTE SERVICE] Buscando cliente ID: ${id}`)
  
  try {
    const response = await fetchWithTimeout(
      `/api/clientes?id=${id}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )

    if (!response.ok) {
      await handleApiError(response, 'Erro ao buscar cliente')
    }

    const data = await response.json()
    console.log(`[CLIENTE SERVICE] Cliente encontrado:`, data[0] ? 'Sim' : 'Não')
    return data[0] as Cliente || null
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao buscar cliente:', error)
    throw error
  }
}

export async function getClientes(empresa: string): Promise<Cliente[]> {
  if (!empresa || typeof empresa !== 'string' || empresa.trim().length === 0) {
    throw new Error('Nome da empresa é obrigatório')
  }
  
  console.log('[CLIENTE SERVICE] Buscando clientes para empresa:', empresa)
  
  try {
    const response = await fetchWithTimeout(
      `/api/clientes?empresa=${encodeURIComponent(empresa)}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )

    if (!response.ok) {
      await handleApiError(response, 'Erro ao buscar clientes')
    }

    const data = await response.json()
    console.log('[CLIENTE SERVICE] Clientes encontrados:', data.length)
    return data
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao buscar clientes:', error)
    throw error
  }
}

export async function getClientesRecentes(empresa: string, limite: number = 10): Promise<Cliente[]> {
  try {
    const response = await fetchWithTimeout(
      `/api/clientes?empresa=${encodeURIComponent(empresa)}&limite=${limite}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )

    if (!response.ok) {
      await handleApiError(response, 'Erro ao buscar clientes recentes')
    }

    const data = await response.json()
    console.log(`[CLIENTE SERVICE] ${data.length} clientes recentes encontrados`)
    return data
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao buscar clientes recentes:', error)
    throw error
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
      `/api/clientes`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(clienteData)
      }
    )

    if (!response.ok) {
      await handleApiError(response, 'Erro ao criar cliente')
    }

    const [data] = await response.json()
    console.log('[CLIENTE SERVICE] Cliente criado com sucesso. ID:', data.id)
    return data as Cliente
  } catch (error) {
    console.error('[CLIENTE SERVICE] Erro ao criar cliente:', error)
    throw error
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
      `/api/clientes`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ id, ...updateData })
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
      `/api/clientes?id=${id}`,
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

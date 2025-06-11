import { NextRequest, NextResponse } from 'next/server';

// Constantes para autenticação com o Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

// Headers padrão para requisições ao Supabase
const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

// Tipos baseados na estrutura da tabela lalunna_clientes
export interface Cliente {
  id: number;
  created_at: string;
  nome: string | null;
  whatsapp: string | null;
  empresa: string | null;
  id_campanha: string | null;
  cidade?: string | null;
}

// Tipos para criar/atualizar um cliente
export type ClienteInsert = Omit<Cliente, 'id' | 'created_at' | 'id_campanha'>;
export type ClienteUpdate = Partial<ClienteInsert>;

// Nota: A verificação de autenticação foi temporariamente desativada para resolver o problema de timeout
// Em produção, deve-se implementar uma verificação mais robusta

// GET /api/clientes - Listar todos os clientes
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const empresa = url.searchParams.get('empresa');
  const id = url.searchParams.get('id');
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || '10';
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  try {
    console.log('[API] Consultando clientes');
    
    // Construir a URL base
    let apiUrl = `${SUPABASE_URL}/rest/v1/lalunna_clientes?select=*`;
    
    // Adicionar filtros
    if (id) {
      apiUrl += `&id=eq.${id}`;
    } else if (empresa) {
      apiUrl += `&empresa=eq.${encodeURIComponent(empresa)}`;
    }
    
    // Adicionar paginação e ordenação
    apiUrl += `&order=created_at.desc&limit=${limitNum}&offset=${offset}`;
    
    // Fazer a requisição
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        ...getSupabaseHeaders(),
        'Prefer': 'count=exact'
      }
    });
    
    if (!response.ok) {
      console.error('[API] Erro na resposta:', response.status, response.statusText);
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    // Obter os dados e o total de registros
    const data = await response.json();
    const contentRange = response.headers.get('content-range');
    const total = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log('[API] Clientes encontrados:', data.length, 'Total:', total);
    
    return NextResponse.json({ 
      data: data || [], 
      total: total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao listar clientes', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/clientes - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const clienteData: Cliente = await request.json();
    
    // Validar dados obrigatórios
    if (!clienteData.nome || !clienteData.empresa) {
      return NextResponse.json(
        { error: 'Nome e empresa são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Adicionar data de criação
    const newCliente = {
      ...clienteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('[API] Criando novo cliente:', newCliente.nome);
    
    // Fazer a requisição para criar o cliente
    const response = await fetch(`${SUPABASE_URL}/rest/v1/lalunna_clientes`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(newCliente)
    });
    
    if (!response.ok) {
      console.error('[API] Erro ao criar cliente:', response.status, response.statusText);
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[API] Cliente criado com sucesso:', data);
    
    return NextResponse.json(data || {}, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cliente', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/clientes - Atualizar cliente existente
export async function PUT(request: NextRequest) {
  try {
    const clienteData: Cliente = await request.json();
    
    // Validar ID
    if (!clienteData.id) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      );
    }
    
    // Atualizar data de modificação
    const updatedCliente = {
      ...clienteData,
      updated_at: new Date().toISOString()
    };
    
    console.log('[API] Atualizando cliente:', clienteData.id);
    
    // Fazer a requisição para atualizar o cliente
    const response = await fetch(`${SUPABASE_URL}/rest/v1/lalunna_clientes?id=eq.${clienteData.id}`, {
      method: 'PATCH',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(updatedCliente)
    });
    
    if (!response.ok) {
      console.error('[API] Erro ao atualizar cliente:', response.status, response.statusText);
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    // Verificar se o cliente foi encontrado
    if (response.status === 204) {
      // Supabase retorna 204 No Content em atualizações bem-sucedidas
      // Buscar o cliente atualizado
      const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/lalunna_clientes?id=eq.${clienteData.id}`, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });
      
      if (!getResponse.ok) {
        throw new Error(`Erro ao buscar cliente atualizado: ${getResponse.status}`);
      }
      
      const data = await getResponse.json();
      console.log('[API] Cliente atualizado com sucesso:', data);
      
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Cliente não encontrado após atualização' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(data[0]);
    }
    
    return NextResponse.json(
      { error: 'Erro inesperado ao atualizar cliente' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/clientes - Excluir cliente
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID do cliente é obrigatório' },
      { status: 400 }
    );
  }

  try {
    console.log('[API] Verificando se o cliente existe:', id);
    
    // Verificar se o cliente existe antes de excluir
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lalunna_clientes?id=eq.${id}`,
      {
        method: 'GET',
        headers: getSupabaseHeaders()
      }
    );
    
    if (!checkResponse.ok) {
      console.error('[API] Erro ao verificar cliente:', checkResponse.status);
      throw new Error(`Erro ao verificar cliente: ${checkResponse.status}`);
    }
    
    const cliente = await checkResponse.json();
    
    if (!cliente || cliente.length === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    console.log('[API] Excluindo cliente:', id);
    
    // Excluir o cliente
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lalunna_clientes?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: getSupabaseHeaders()
      }
    );
    
    if (!deleteResponse.ok) {
      console.error('[API] Erro ao excluir cliente:', deleteResponse.status);
      throw new Error(`Erro ao excluir cliente: ${deleteResponse.status}`);
    }
    
    console.log('[API] Cliente excluído com sucesso');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir cliente', details: error.message },
      { status: 500 }
    );
  }
}

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Bot {
  id: string;
  nome: string;
  url_base: string | null;
  token: string | null;
  status: string | null;
  rede: string | null;
  sub_rede: string | null;
  loja: string | null;
  qrcode: string | null;
  numero: string | null;
  perfil: string | null;
  texto_niver0dias: string | null;
  Parceiro: string | null;
  looping: number | null;
  atualizada: boolean | null;
  texto_niver1dias: string | null;
  texto_niver15dias: string | null;
}

// Função para verificar a sessão e permissões do usuário
async function checkUserSession() {
  if (!supabase) {
    throw new Error('Cliente Supabase não está disponível');
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session) throw new Error('Nenhuma sessão ativa encontrada');
    
    console.log('[BOT SERVICE] Sessão do usuário:', {
      user_id: session.user?.id,
      email: session.user?.email,
      role: (session.user as any)?.role || 'unknown'
    });
    
    return session;
  } catch (error) {
    console.error('[BOT SERVICE] Erro ao verificar sessão:', error);
    throw error;
  }
}

// Função para listar tabelas disponíveis no banco de dados
async function listTables() {
  if (!supabase) {
    console.error('[BOT SERVICE] Cliente Supabase não disponível para listar tabelas');
    return [];
  }

  const tables = [];
  
  // Tenta listar tabelas usando information_schema
  try {
    console.log('[BOT SERVICE] Tentando listar tabelas via information_schema...');
    const { data: schemaTables, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .in('table_schema', ['public', 'auth', 'storage']);
      
    if (!schemaError && schemaTables) {
      const tableList = schemaTables.map(t => `${t.table_schema}.${t.table_name}`);
      console.log(`[BOT SERVICE] Encontradas ${tableList.length} tabelas via information_schema`);
      tables.push(...tableList);
    }
  } catch (schemaEx) {
    console.warn('[BOT SERVICE] Não foi possível listar tabelas via information_schema:', schemaEx);
  }
  
  // Tenta usar a função RPC se disponível
  try {
    console.log('[BOT SERVICE] Tentando listar tabelas via RPC...');
    const { data: rpcTables, error: rpcError } = await supabase.rpc('list_tables');
    
    if (!rpcError && rpcTables) {
      console.log(`[BOT SERVICE] Encontradas ${rpcTables.length} tabelas via RPC`);
      tables.push(...rpcTables);
    }
  } catch (rpcEx) {
    console.warn('[BOT SERVICE] Não foi possível listar tabelas via RPC:', rpcEx);
  }
  
  // Remove duplicatas
  const uniqueTables = [...new Set(tables)];
  console.log(`[BOT SERVICE] Total de tabelas únicas encontradas: ${uniqueTables.length}`);
  
  return uniqueTables;
}

// Função para verificar acesso direto à tabela bots
async function checkBotsTableAccess() {
  if (!supabase) return false;
  
  try {
    // Primeiro tenta listar as tabelas disponíveis
    const tables = await listTables();
    console.log('[BOT SERVICE] Tabelas disponíveis no banco:', tables);
    
    // Verifica se a tabela bots está na lista
    if (tables.length > 0 && !tables.includes('bots')) {
      console.error('[BOT SERVICE] Tabela "bots" não encontrada no banco de dados');
      return false;
    }
    
    // Tenta acessar a tabela diretamente
    const { data, error } = await supabase
      .from('bots')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('[BOT SERVICE] Erro ao acessar tabela bots:', error);
      return false;
    }
    
    console.log('[BOT SERVICE] Acesso à tabela bots bem-sucedido');
    return true;
  } catch (error) {
    console.error('[BOT SERVICE] Erro inesperado ao acessar tabela bots:', error);
    return false;
  }
}

// Função para listar funções RPC disponíveis
async function listAvailableRpcFunctions() {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .ilike('proname', 'get_%')
      .limit(20);
      
    if (error) {
      console.warn('[BOT SERVICE] Não foi possível listar funções RPC:', error);
      return [];
    }
    
    const functions = data?.map(f => f.proname) || [];
    console.log('[BOT SERVICE] Funções RPC disponíveis (amostra):', functions);
    return functions;
  } catch (error) {
    console.error('[BOT SERVICE] Erro ao listar funções RPC:', error);
    return [];
  }
}

// Função para verificar o esquema do banco de dados
async function checkDatabaseSchema() {
  if (!supabase) return null;
  
  try {
    // Primeiro lista as funções RPC disponíveis
    const availableFunctions = await listAvailableRpcFunctions();
    console.log('[BOT SERVICE] Funções RPC disponíveis:', availableFunctions);
    
    // Tenta obter informações sobre o esquema atual
    const { data: schemaInfo, error } = await supabase.rpc('get_schema_info');
    
    if (error) {
      console.warn('[BOT SERVICE] Não foi possível obter informações do esquema:', error);
      
      // Tenta uma abordagem alternativa se a função específica não existir
      if (availableFunctions.includes('current_schema')) {
        console.log('[BOT SERVICE] Tentando obter esquema atual via current_schema()');
        const { data: currentSchema } = await supabase.rpc('current_schema');
        return { search_path: currentSchema };
      }
      
      return null;
    }
    
    console.log('[BOT SERVICE] Informações do esquema:', schemaInfo);
    return schemaInfo;
  } catch (error) {
    console.error('[BOT SERVICE] Erro ao verificar esquema do banco:', error);
    return null;
  }
}

export async function getBotByToken(userId: string): Promise<Bot | null> {
  console.log('[BOT SERVICE] Iniciando busca por bot para usuário ID:', userId);
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível';
    console.error('[BOT SERVICE]', errorMsg);
    return null;
  }

  if (!userId) {
    const errorMsg = 'ID do usuário não fornecido para buscar o bot';
    console.error('[BOT SERVICE]', errorMsg);
    return null;
  }
  
  try {
    // Verifica o esquema do banco de dados
    const schemaInfo = await checkDatabaseSchema();
    console.log('[BOT SERVICE] Esquema do banco:', schemaInfo || 'Não foi possível obter informações do esquema');
    
    // Tenta buscar o bot diretamente usando o token do usuário
    console.log('[BOT SERVICE] Buscando usuário para obter token de instância...');
    const { data: currentUser, error: userLookupError } = await supabase
      .from('users')
      .select('id, email, instancia')
      .eq('id', userId)
      .single();
      
    if (userLookupError || !currentUser) {
      console.error('[BOT SERVICE] Erro ao buscar usuário:', userLookupError || 'Usuário não encontrado');
      return null;
    }
    
    console.log('[BOT SERVICE] Dados do usuário encontrados:', {
      id: currentUser.id,
      email: currentUser.email,
      has_instancia: !!currentUser.instancia
    });
    
    const instanceToken = currentUser.instancia;
    if (!instanceToken) {
      console.error('[BOT SERVICE] Usuário não possui token de instância configurado');
      return null;
    }
    
    // Verifica se temos acesso à tabela bots
    const hasTableAccess = await checkBotsTableAccess();
    if (!hasTableAccess) {
      console.error('[BOT SERVICE] Sem acesso à tabela bots');
      
      // Tenta buscar em um schema específico se disponível
      if (schemaInfo?.search_path) {
        console.log(`[BOT SERVICE] Tentando acessar schema: ${schemaInfo.search_path}`);
      }
      
      // Tenta listar as primeiras entradas da tabela bots para depuração
      await debugBotsTableAccess();
      return null;
    }
    
    console.log('[BOT SERVICE] Buscando bot com token de instância:', instanceToken);
    const { data: foundBot, error: botLookupError } = await supabase
      .from('bots')
      .select('*')
      .eq('token', instanceToken)
      .single();
      
    if (botLookupError || !foundBot) {
      console.error('[BOT SERVICE] Erro ao buscar bot:', botLookupError || 'Bot não encontrado');
      return null;
    }
    
    console.log('[BOT SERVICE] Bot encontrado:', { 
      id: foundBot.id, 
      nome: foundBot.nome,
      status: foundBot.status 
    });
    
    return foundBot;
  } catch (error) {
    console.error('[BOT SERVICE] Erro inesperado ao buscar bot:', error);
    return null;
  }
}

// Função auxiliar para depurar acesso à tabela bots
async function debugBotsTableAccess() {
  if (!supabase) return;
  
  try {
    console.log('[BOT SERVICE] Tentando listar primeiras entradas da tabela bots...');
    
    // Tenta sem schema
    const { data: sampleBots, error: sampleError } = await supabase
      .from('bots')
      .select('*')
      .limit(3);
      
    if (sampleError) {
      console.error('[BOT SERVICE] Erro ao buscar amostra de bots (sem schema):', sampleError);
      
      // Tenta com schema público explícito
      console.log('[BOT SERVICE] Tentando com schema público explícito...');
      const { data: publicBots, error: publicError } = await supabase
        .from('public.bots')
        .select('*')
        .limit(3);
        
      if (publicError) {
        console.error('[BOT SERVICE] Erro ao buscar amostra de bots (schema público):', publicError);
      } else if (publicBots) {
        logBotSample(publicBots, 'schema público');
      }
    } else if (sampleBots) {
      logBotSample(sampleBots, 'sem schema');
    }
  } catch (sampleEx) {
    console.error('[BOT SERVICE] Erro ao tentar listar amostra de bots:', sampleEx);
  }
}

// Função auxiliar para registrar amostra de bots
function logBotSample(bots: any[], context: string) {
  console.log(`[BOT SERVICE] Amostra de bots encontrados (${context}):`, bots);
  if (bots.length > 0) {
    console.log(`[BOT SERVICE] Estrutura do primeiro bot (${context}):`, Object.keys(bots[0]));
  }
}

// Função para buscar dados do usuário
async function fetchUserData(userId: string) {
  if (!supabase) {
    console.error('[BOT SERVICE] Cliente Supabase não disponível');
    return null;
  }

  console.log('[BOT SERVICE] Buscando dados do usuário...');
  
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    return userData;
  } catch (error) {
    console.error('[BOT SERVICE] Erro ao buscar dados do usuário:', error);
    return null;
  }
}

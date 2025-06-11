'use client'

import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'

// Removendo o campo destaque do tipo Produto
export type Produto = Omit<Tables<'lalunna_produtos'>, 'destaque'>

const BUCKET_NAME = 'disparador'

export async function countProdutos(empresa: string): Promise<number> {
  console.log('[PRODUTO SERVICE] Contando produtos para empresa:', empresa);
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível';
    console.error('[PRODUTO SERVICE]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const { count, error } = await supabase
      .from('lalunna_produtos')
      .select('*', { count: 'exact', head: true })
      .eq('empresa', empresa);

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao contar produtos:', error);
      throw new Error('Erro ao contar produtos');
    }

    console.log('[PRODUTO SERVICE] Total de produtos encontrados:', count);
    return count || 0;
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao contar produtos:', error);
    throw error;
  }
}

export async function getProdutos(empresa: string): Promise<Produto[]> {
  console.log('[PRODUTO SERVICE] Iniciando busca de produtos para empresa:', empresa)
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível'
    console.error('[PRODUTO SERVICE]', errorMsg)
    throw new Error(errorMsg)
  }

  try {
    console.log('[PRODUTO SERVICE] Executando consulta no Supabase...')
    const { data, error } = await supabase
      .from('lalunna_produtos')
      .select('*')
      .eq('empresa', empresa)
      .order('created_at', { ascending: false })

    console.log('[PRODUTO SERVICE] Resposta do Supabase:', { data, error })

    if (error) {
      console.error('[PRODUTO SERVICE] Erro na consulta:', error)
      throw new Error('Erro ao carregar produtos')
    }

    console.log(`[PRODUTO SERVICE] ${data?.length || 0} produtos encontrados`)
    return data || []
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao buscar produtos:', error)
    throw error
  }
}

export async function getProduto(id: string): Promise<Produto> {
  console.log('[PRODUTO SERVICE] Buscando produto com ID:', id)
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível'
    console.error('[PRODUTO SERVICE]', errorMsg)
    throw new Error(errorMsg)
  }

  try {
    console.log('[PRODUTO SERVICE] Buscando produto no Supabase...')
    const { data, error } = await supabase
      .from('lalunna_produtos')
      .select('*')
      .eq('id', id)
      .single()

    console.log('[PRODUTO SERVICE] Resposta do Supabase:', { data, error })

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao buscar produto:', error)
      throw new Error('Produto não encontrado')
    }

    if (!data) {
      throw new Error('Produto não encontrado')
    }

    console.log('[PRODUTO SERVICE] Produto encontrado:', data)
    return data
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao buscar produto:', error)
    throw error
  }
}

export async function updateProduto(id: string, updates: Partial<Omit<Produto, 'id' | 'empresa' | 'created_at'>>) {
  console.log('[PRODUTO SERVICE] Atualizando produto ID:', id, 'com dados:', updates)
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível'
    console.error('[PRODUTO SERVICE]', errorMsg)
    throw new Error(errorMsg)
  }

  try {
    console.log('[PRODUTO SERVICE] Enviando atualização para o Supabase...')
    const { data, error } = await supabase
      .from('lalunna_produtos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    console.log('[PRODUTO SERVICE] Resposta do Supabase:', { data, error })

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao atualizar produto:', error)
      throw new Error('Erro ao atualizar produto')
    }

    console.log('[PRODUTO SERVICE] Produto atualizado com sucesso:', data)
    return data
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao atualizar produto:', error)
    throw error
  }
}

export async function createProduto(produto: Omit<Produto, 'id' | 'created_at' | 'status'> & { status?: string }) {
  console.log('[PRODUTO SERVICE] Criando novo produto:', produto)
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível'
    console.error('[PRODUTO SERVICE]', errorMsg)
    throw new Error(errorMsg)
  }

  try {
    // Preparar os dados do produto com todos os campos necessários
    const produtoData = {
      titulo: produto.titulo,
      descricao: produto.descricao,
      valor: produto.valor,
      url_foto: produto.url_foto,
      status: (produto.status || 'ATIVADO').toUpperCase(),
      empresa: produto.empresa,
      tipo_tamanho: produto.tipo_tamanho,
      tamanho: produto.tamanho,
      created_at: new Date().toISOString()
    };

    console.log('[PRODUTO SERVICE] Dados do produto processados:', produtoData);
    console.log('[PRODUTO SERVICE] Enviando dados para o Supabase...');
    
    const { data, error } = await supabase
      .from('lalunna_produtos')
      .insert([produtoData])
      .select()

    console.log('[PRODUTO SERVICE] Resposta do Supabase:', { data, error })

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao criar produto:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Erro ao salvar produto no banco de dados');
    }

    if (!data || data.length === 0) {
      const errorMsg = 'Nenhum dado retornado ao criar produto';
      console.error('[PRODUTO SERVICE]', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('[PRODUTO SERVICE] Produto criado com sucesso:', data[0])
    return data[0]
  } catch (error: any) {
    console.error('[PRODUTO SERVICE] Erro detalhado ao criar produto:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response })
    });
    throw new Error(error.message || 'Erro ao criar produto');
  }
}

export async function uploadProdutoImage(file: File, empresa: string): Promise<string> {
  if (!supabase) {
    console.error('Supabase client não está disponível')
    throw new Error('Erro de conexão com o servidor')
  }

  try {
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${empresa}/${uuidv4()}.${fileExt}`
    
    console.log(`[PRODUTO SERVICE] Fazendo upload da imagem: ${fileName}`)
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao fazer upload da imagem:', error)
      throw new Error('Erro ao fazer upload da imagem')
    }

    // Constrói a URL pública diretamente usando o formato correto
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`
    
    console.log('[PRODUTO SERVICE] Upload da imagem concluído:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao fazer upload da imagem:', error)
    throw error
  }
}

export async function deleteProdutoImage(imageUrl: string): Promise<void> {
  console.log('[PRODUTO SERVICE] Iniciando deleteProdutoImage com URL:', imageUrl)
  
  if (!supabase) {
    const errorMsg = 'Supabase client não está disponível'
    console.error('[PRODUTO SERVICE]', errorMsg)
    throw new Error(errorMsg)
  }

  if (!imageUrl) {
    console.log('[PRODUTO SERVICE] Nenhuma URL fornecida para exclusão')
    return
  }

  try {
    console.log('[PRODUTO SERVICE] Extraindo caminho do arquivo da URL:', imageUrl)
    
    // Extrai o caminho do arquivo da URL
    let filePath: string
    
    try {
      // Tenta extrair o caminho da URL
      const url = new URL(imageUrl)
      console.log('[PRODUTO SERVICE] URL parseada:', {
        origin: url.origin,
        pathname: url.pathname,
        searchParams: url.searchParams
      })
      
      // Remove o prefixo do bucket do caminho
      const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
      console.log('[PRODUTO SERVICE] Partes do caminho:', pathParts)
      
      if (pathParts.length < 2) {
        throw new Error(`Formato de URL inesperado. Não foi possível extrair o caminho do arquivo de: ${url.pathname}`)
      }
      
      filePath = decodeURIComponent(pathParts[1] || '')
      
      if (!filePath) {
        throw new Error('Caminho do arquivo vazio após extração')
      }
      
      console.log('[PRODUTO SERVICE] Caminho extraído com sucesso:', filePath)
    } catch (error) {
      console.error('[PRODUTO SERVICE] Erro ao extrair caminho da URL, tentando usar como caminho direto. Erro:', error)
      // Se não for uma URL válida, assume que já é o caminho
      filePath = imageUrl
    }
    
    console.log(`[PRODUTO SERVICE] Tentando remover arquivo do storage: ${filePath}`)
    
    // Remove o arquivo do storage
    console.log('[PRODUTO SERVICE] Chamando supabase.storage.remove...')
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    console.log('[PRODUTO SERVICE] Resposta do supabase.storage.remove:', { data, error })

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao excluir imagem:', error)
      throw new Error(`Erro ao excluir imagem do produto: ${error.message}`)
    }
    
    console.log('[PRODUTO SERVICE] Imagem excluída com sucesso')
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao excluir imagem:', error)
    // Relançamos o erro para que a função chamadora saiba que houve falha
    throw error
  }
}

export async function deleteProduto(id: string, imageUrl?: string | null): Promise<void> {
  if (!supabase) {
    console.error('Supabase client não está disponível')
    throw new Error('Erro de conexão com o servidor')
  }

  try {
    console.log(`[PRODUTO SERVICE] Iniciando exclusão do produto ${id}`)
    
    // Primeiro, exclui a imagem se existir
    if (imageUrl) {
      console.log(`[PRODUTO SERVICE] Excluindo imagem do produto: ${imageUrl}`)
      try {
        await deleteProdutoImage(imageUrl)
      } catch (error) {
        console.error('[PRODUTO SERVICE] Aviso: Não foi possível excluir a imagem do produto:', error)
        // Continua mesmo se não conseguir excluir a imagem
      }
    } else {
      console.log('[PRODUTO SERVICE] Nenhuma imagem para excluir')
    }

    // Depois, exclui o produto
    console.log(`[PRODUTO SERVICE] Excluindo registro do produto ${id} do banco de dados`)
    const { error } = await supabase
      .from('lalunna_produtos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[PRODUTO SERVICE] Erro ao excluir produto:', error)
      throw new Error('Erro ao excluir produto')
    }
    
    console.log('[PRODUTO SERVICE] Produto excluído com sucesso')
  } catch (error) {
    console.error('[PRODUTO SERVICE] Erro ao excluir produto:', error)
    throw error
  }
}

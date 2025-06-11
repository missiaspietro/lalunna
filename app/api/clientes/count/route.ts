import { NextRequest, NextResponse } from 'next/server';

// GET /api/clientes/count - Contar clientes
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const empresa = url.searchParams.get('empresa');

  if (!empresa) {
    return NextResponse.json(
      { error: 'Parâmetro empresa é obrigatório' },
      { status: 400 }
    );
  }

  try {
    console.log('[API] Consultando clientes para empresa:', empresa);
    
    // Usando fetch diretamente para consultar a API do Supabase
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/lalunna_clientes?select=count&empresa=eq.${encodeURIComponent(empresa)}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      }
    );

    if (!response.ok) {
      console.error('[API] Erro na resposta:', response.status, response.statusText);
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    // Obter o total de registros do header
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log('[API] Total de clientes encontrados:', count);
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Erro ao contar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao contar clientes', details: error.message },
      { status: 500 }
    );
  }
}

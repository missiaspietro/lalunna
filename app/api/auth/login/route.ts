import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos' }, 
        { status: 400 }
      )
    }
    
    // Inicializa o cliente Supabase no servidor
    const supabase = createClient()
    
    // Busca o usuário na tabela users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('senha', password)
      .single()
    
    // Se houver erro na consulta ou usuário não encontrado
    if (error || !user) {
      return NextResponse.json(
        { error: 'E-mail e/ou senha incorretos. Tente novamente.' }, 
        { status: 401 }
      )
    }
    
    // Verifica se o usuário tem uma empresa definida
    if (!user.empresa) {
      return NextResponse.json(
        { error: 'Sua conta não possui uma empresa associada. Entre em contato com o suporte.' }, 
        { status: 403 }
      )
    }
    
    // Retorna os dados do usuário (sem a senha)
    const { senha, ...userData } = user
    
    return NextResponse.json({ 
      user: userData,
      message: 'Login realizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro no servidor. Tente novamente mais tarde.' }, 
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware simplificado - toda a lógica de autenticação foi movida para o AuthHandler em _app.tsx
export function middleware(request: NextRequest) {
  // Permite todas as requisições
  return NextResponse.next()
}

// Configuração do middleware
export const config = {
  // Não protege nenhuma rota - a proteção é feita no cliente
  matcher: [],
}

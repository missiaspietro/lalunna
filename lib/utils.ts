import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: string): string {
  if (!data) return ''
  try {
    const date = new Date(data)
    return new Intl.DateTimeFormat('pt-BR').format(date)
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return data
  }
}

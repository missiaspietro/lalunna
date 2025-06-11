export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          criado_em: string | null
          nome: string | null
          senha: string | null
          whatsapp: string | null
          email: string | null
          empresa: string | null
          instancia: string | null
          qrcode: string | null
          nivel: string | null
          sistema: string | null
          ministerio: string | null
          tela_dashboard: string | null
          tela_visitantes: string | null
          tela_historico: string | null
          tela_mensagens: string | null
          tela_eventos: string | null
          tela_treinamento: string | null
          tela_conexao: string | null
          tela_users: string | null
        }
        Insert: {
          id?: number
          criado_em?: string | null
          nome?: string | null
          senha?: string | null
          whatsapp?: string | null
          email?: string | null
          empresa?: string | null
          instancia?: string | null
          qrcode?: string | null
          nivel?: string | null
          sistema?: string | null
          ministerio?: string | null
          tela_dashboard?: string | null
          tela_visitantes?: string | null
          tela_historico?: string | null
          tela_mensagens?: string | null
          tela_eventos?: string | null
          tela_treinamento?: string | null
          tela_conexao?: string | null
          tela_users?: string | null
        }
        Update: {
          id?: number
          criado_em?: string | null
          nome?: string | null
          senha?: string | null
          whatsapp?: string | null
          email?: string | null
          empresa?: string | null
          instancia?: string | null
          qrcode?: string | null
          nivel?: string | null
          sistema?: string | null
          ministerio?: string | null
          tela_dashboard?: string | null
          tela_visitantes?: string | null
          tela_historico?: string | null
          tela_mensagens?: string | null
          tela_eventos?: string | null
          tela_treinamento?: string | null
          tela_conexao?: string | null
          tela_users?: string | null
        }
      },
      lalunna_clientes: {
        Row: {
          id: number
          created_at: string
          nome: string | null
          whatsapp: string | null
          email: string | null
          cidade: string | null
          empresa: string | null
          id_campanha: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          nome?: string | null
          whatsapp?: string | null
          email?: string | null
          cidade?: string | null
          empresa?: string | null
          id_campanha?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          nome?: string | null
          whatsapp?: string | null
          email?: string | null
          cidade?: string | null
          empresa?: string | null
          id_campanha?: string | null
        }
      },
      lalunna_produtos: {
        Row: {
          id: string
          created_at: string
          titulo: string | null
          descricao: string | null
          valor: string | null
          url_foto: string | null
          status: string | null
          empresa: string | null
          tipo_tamanho: string | null
          tamanho: string | null
          destaque: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          titulo?: string | null
          descricao?: string | null
          valor?: string | null
          url_foto?: string | null
          status?: string | null
          empresa?: string | null
          tipo_tamanho?: string | null
          tamanho?: string | null
          destaque?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          titulo?: string | null
          descricao?: string | null
          valor?: string | null
          url_foto?: string | null
          status?: string | null
          empresa?: string | null
          tipo_tamanho?: string | null
          tamanho?: string | null
          destaque?: boolean | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

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
      documents: {
        Row: {
          id: number
          created_at: string
          user_id: string
          name: string
          storage_path: string
          size: number
          type: string
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          name: string
          storage_path: string
          size: number
          type: string
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          name?: string
          storage_path?: string
          size?: number
          type?: string
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
  }
}

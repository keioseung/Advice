import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  user_id: string
  user_type: 'father' | 'child'
  name: string
  father_id?: string
  created_at: string
  updated_at: string
}

export type Advice = {
  id: string
  author_id: string
  category: string
  target_age: number
  content: string
  is_read: boolean
  is_favorite: boolean
  created_at: string
  updated_at: string
} 
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabaseの環境変数が設定されてへんで。.env.localにVITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを設定してや。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

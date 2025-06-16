import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

export default supabase 
import { createClient } from '@supabase/supabase-js'
import { slugify } from './utils'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://wnbbfbehmurldrpitsjp.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYmJmYmVobXVybGRycGl0c2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDE0MjMsImV4cCI6MjA5OTA3NzQyM30.4ghJQL5SNeABMvkzn_TL8_2KFCIaa5hgcFxzNjIpHLE'

export const supabase = createClient(url, anonKey)
export { slugify }

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Esta função agora é 'async' para permitir o uso de 'await'
export default async function createClient() {
  const cookieStore = await cookies() // <-- CORREÇÃO: Adicionado 'await'

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // As ações de 'set' e 'remove' podem ser ignoradas com segurança
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Mesma lógica de erro acima
          }
        },
      },
    }
  )
}
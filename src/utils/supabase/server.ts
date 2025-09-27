import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // A função 'get' agora acessa o cookie diretamente do objeto cookieStore
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Adicionamos as funções 'set' e 'remove' para completar a interface
        // que o Supabase espera, garantindo que a sessão possa ser gerenciada
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // O erro "TextEncoder is not a constructor" pode ocorrer em algumas
            // versões do Next.js. Ignorá-lo em 'set' e 'remove' é seguro.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Mesma lógica de erro acima.
          }
        },
      },
    }
  )
}
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Esta função agora é síncrona e não é mais a exportação padrão.
// Ela será chamada a cada vez que uma ação no servidor for executada.
export function createSupabaseServerClient() {
  const cookieStore = cookies()

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
            // A ação 'set' foi chamada de um Server Component.
            // Isso pode ser ignorado com segurança se você tiver um middleware
            // atualizando as sessões do usuário.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // A ação 'remove' foi chamada de um Server Component.
            // Isso pode ser ignorado com segurança.
          }
        },
      },
    }
  )
}
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/utils/supabase/server';

const getWelcomeMessage = (pronoun: string | null | undefined): string => {
  switch (pronoun) {
    case 'Ela/Dela':
      return 'Bem-vinda de volta ao seu Hub.';
    case 'Ele/Dele':
      return 'Bem-vindo de volta ao seu Hub.';
    case 'Elu/Delu':
      return 'Bem-vinde de volta ao seu Hub.';
    default:
      return 'Que bom te ver de volta ao seu Hub.';
  }
};

export default async function DashboardPage() {
    const supabase = createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, pronoun')
      .eq('id', user?.id)
      .single();

    const fullName = profile?.full_name || 'Usuário';
    const welcomeMessage = getWelcomeMessage(profile?.pronoun);

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-4 dark:text-white">
                Olá, {fullName}!
            </h1>
            <p className="text-text-muted dark:text-gray-400">{welcomeMessage}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Próximas Tarefas</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Nenhuma tarefa para hoje.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Última Atividade</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Você completou o módulo de &quot;Primeiros Passos&quot;.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Módulos Favoritos</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Adicione módulos aos favoritos para acesso rápido.</p>
                </div>
            </div>
        </div>
    );
}
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/utils/supabase/server';

export default async function DashboardPage() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    // Como o nome completo já é buscado no layout, podemos pegá-lo dos metadados do usuário.
    // Isso evita uma nova chamada ao banco de dados na tabela 'profiles' aqui.
    const fullName = user?.user_metadata.full_name || 'Usuário';

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-4 dark:text-white">
                Olá, {fullName}!
            </h1>
            <p className="text-text-muted dark:text-gray-400">Bem-vindo(a) de volta ao seu Hub.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Próximas Tarefas</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Nenhuma tarefa para hoje.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Última Atividade</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Você completou o módulo de "Primeiros Passos".</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Módulos Favoritos</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Adicione módulos aos favoritos para acesso rápido.</p>
                </div>
            </div>
        </div>
    );
}
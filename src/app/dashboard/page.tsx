import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/utils/supabase/server';

export default async function DashboardPage() {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    // Você já tem a sessão e o perfil no layout, mas pode buscar
    // dados específicos para esta página aqui.
    const { data: { user } } = await supabase.auth.getUser();

    // Exemplo de busca de dados para a página principal
    // const { data: tasks } = await supabase.from('tasks').select('*').limit(5);

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-4">
                Olá, {user?.user_metadata.full_name || 'Usuário'}!
            </h1>
            <p className="text-text-muted">Bem-vindo(a) de volta ao seu Hub.</p>
            
            {/* Aqui você pode começar a construir os widgets do seu dashboard */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Próximas Tarefas</h2>
                    <p className="text-sm text-text-muted">Nenhuma tarefa para hoje.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Última Atividade</h2>
                    <p className="text-sm text-text-muted">Você completou o módulo de "Primeiros Passos".</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Módulos Favoritos</h2>
                    <p className="text-sm text-text-muted">Adicione módulos aos favoritos para acesso rápido.</p>
                </div>
            </div>
        </div>
    );
}
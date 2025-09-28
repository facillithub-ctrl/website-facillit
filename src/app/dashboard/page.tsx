import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
// CORREÇÃO APLICADA AQUI: caminho relativo para o alias
import { getLatestEssayForDashboard } from '@/app/dashboard/applications/write/actions';

const getWelcomeMessage = (pronoun: string | null | undefined): string => {
  switch (pronoun) {
    case 'Ela/Dela': return 'Bem-vinda de volta ao seu Hub.';
    case 'Ele/Dele': return 'Bem-vindo de volta ao seu Hub.';
    case 'Elu/Delu': return 'Bem-vinde de volta ao seu Hub.';
    default: return 'Que bom te ver de volta ao seu Hub.';
  }
};

// Componente para o Card do Write
const WriteDashboardWidget = ({ lastEssay }: { lastEssay: { id: string, title: string | null, status: string } | null }) => {
    const getStatusText = (status: string) => {
        const map = {
            draft: 'Rascunho',
            submitted: 'Aguardando correção',
            corrected: 'Corrigida'
        };
        return map[status as keyof typeof map] || 'Status desconhecido';
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 flex flex-col">
            <h2 className="font-bold mb-2 dark:text-white">Redação em Destaque</h2>
            {lastEssay ? (
                <div className="flex-grow">
                    <p className="text-sm text-text-muted dark:text-gray-400">Sua última redação:</p>
                    <p className="font-semibold text-dark-text dark:text-white truncate">{lastEssay.title || 'Redação sem título'}</p>
                    <p className="text-xs text-gray-500">{getStatusText(lastEssay.status)}</p>
                </div>
            ) : (
                <p className="text-sm text-text-muted dark:text-gray-400 flex-grow">Nenhuma redação iniciada ainda. Que tal começar uma agora?</p>
            )}
            <Link href="/dashboard/applications/write" className="mt-4 text-sm font-bold text-royal-blue self-start">
                Ir para o Facillit Write <i className="fas fa-arrow-right ml-1"></i>
            </Link>
        </div>
    )
}


export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Busca de dados em paralelo
    const [profileResult, lastEssayResult] = await Promise.all([
        supabase.from('profiles').select('full_name, pronoun').eq('id', user?.id).single(),
        getLatestEssayForDashboard()
    ]);
    
    const profile = profileResult.data;
    const lastEssay = lastEssayResult.data;

    const fullName = profile?.full_name || 'Usuário';
    const welcomeMessage = getWelcomeMessage(profile?.pronoun);

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-4 dark:text-white">Olá, {fullName}!</h1>
            <p className="text-text-muted dark:text-gray-400">{welcomeMessage}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* NOVO CARD DO WRITE */}
                <WriteDashboardWidget lastEssay={lastEssay} />

                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Próximas Tarefas</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Nenhuma tarefa para hoje.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="font-bold mb-2 dark:text-white">Última Atividade</h2>
                    <p className="text-sm text-text-muted dark:text-gray-400">Você completou o módulo de &quot;Primeiros Passos&quot;.</p>
                </div>
            </div>
        </div>
    );
}
import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
import { getLatestEssayForDashboard } from '@/app/dashboard/applications/write/actions';
import { getLatestTestAttemptForDashboard } from '@/app/dashboard/applications/test/actions';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

const getWelcomeMessage = (pronoun: string | null | undefined): string => {
  switch (pronoun) {
    case 'Ela/Dela': return 'Bem-vinda de volta ao seu Hub.';
    case 'Ele/Dele': return 'Bem-vindo de volta ao seu Hub.';
    case 'Elu/Delu': return 'Bem-vinde de volta ao seu Hub.';
    default: return 'Que bom te ver de volta ao seu Hub.';
  }
};

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
        <div className="glass-card p-6 flex flex-col h-full">
            <h2 className="font-bold mb-2 dark:text-white">Redação em Destaque</h2>
            {lastEssay ? (
                <div className="flex-grow">
                    <p className="text-sm text-dark-text-muted">Sua última redação:</p>
                    <p className="font-semibold text-dark-text dark:text-white truncate">{lastEssay.title || 'Redação sem título'}</p>
                    <p className="text-xs text-gray-500">{getStatusText(lastEssay.status)}</p>
                </div>
            ) : (
                <p className="text-sm text-dark-text-muted flex-grow">Nenhuma redação iniciada ainda. Que tal começar uma agora?</p>
            )}
            <Link href="/dashboard/applications/write" className="mt-4 text-sm font-bold text-royal-blue self-start">
                Ir para o Facillit Write <i className="fas fa-arrow-right ml-1"></i>
            </Link>
        </div>
    )
}

const TestDashboardWidget = ({ lastAttempt }: { lastAttempt: { score: number | null, tests: { title: string | null } | null } | null }) => {
    return (
        <div className="glass-card p-6 flex flex-col h-full">
            <h2 className="font-bold mb-2 dark:text-white">Simulados em Destaque</h2>
            {lastAttempt ? (
                <div className="flex-grow">
                    <p className="text-sm text-dark-text-muted">Seu último resultado:</p>
                    <p className="font-semibold text-dark-text dark:text-white truncate">{lastAttempt.tests?.title || 'Simulado'}</p>
                    <p className="text-2xl font-bold text-royal-blue mt-1">{lastAttempt.score?.toFixed(0)}% <span className="text-sm font-normal text-dark-text-muted">de acerto</span></p>
                </div>
            ) : (
                <p className="text-sm text-dark-text-muted flex-grow">Nenhum simulado finalizado ainda. Que tal fazer um agora?</p>
            )}
            <Link href="/dashboard/applications/test" className="mt-4 text-sm font-bold text-royal-blue self-start">
                Ir para o Facillit Test <i className="fas fa-arrow-right ml-1"></i>
            </Link>
        </div>
    );
};


export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return null; }

    const [profileResult, lastEssayResult, lastTestResult] = await Promise.all([
        supabase.from('profiles').select('full_name, pronoun, target_exam').eq('id', user.id).single(),
        getLatestEssayForDashboard(),
        getLatestTestAttemptForDashboard()
    ]);

    const profile = profileResult.data;
    const lastEssay = lastEssayResult.data;
    const lastTestAttempt = lastTestResult.data;
    
    // Correction: Ensure the 'tests' property is an object, not an array.
    const lastAttemptForWidget = lastTestAttempt ? {
        score: lastTestAttempt.score,
        tests: Array.isArray(lastTestAttempt.tests) ? lastTestAttempt.tests[0] : lastTestAttempt.tests,
    } : null;


    let examDate: { name: string, exam_date: string } | null = null;
    if (profile?.target_exam) {
        const { data } = await supabase.from('exam_dates').select('name, exam_date').eq('name', profile.target_exam).single();
        examDate = data;
    }

    const fullName = profile?.full_name || 'Usuário';
    const welcomeMessage = getWelcomeMessage(profile?.pronoun);

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-1">Olá, {fullName}!</h1>
            <p className="text-text-muted dark:text-gray-400">{welcomeMessage}</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-card p-6 lg:col-span-2">
                    {examDate ? (
                        <CountdownWidget targetExam={examDate.name} examDate={examDate.exam_date} />
                    ) : (
                         <div className="h-full flex flex-col justify-center text-center">
                            <h2 className="font-bold mb-2 dark:text-white">Contagem Regressiva</h2>
                            <p className="text-sm text-dark-text-muted">Defina um vestibular alvo no seu perfil para ver a contagem aqui.</p>
                        </div>
                    )}
                </div>

                <WriteDashboardWidget lastEssay={lastEssay} />
                
                <TestDashboardWidget lastAttempt={lastAttemptForWidget} />

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow dark:bg-gray-800 dark:border-yellow-600 lg:col-span-2">
                    <div className="flex">
                        <div className="flex-shrink-0"><i className="fas fa-exclamation-triangle text-yellow-500"></i></div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Esta plataforma está em desenvolvimento. Bugs podem acontecer.
                            </p>
                            <div className="mt-2 text-sm">
                                <a href="mailto:suporte@facillithub.com.br" className="font-medium text-yellow-700 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-200">
                                    Encontrou algum problema? Envie um feedback.
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 lg:col-span-2">
                    <h2 className="font-bold mb-2 dark:text-white">Próximas Tarefas</h2>
                    <p className="text-sm text-dark-text-muted">Nenhuma tarefa para hoje.</p>
                </div>
            </div>
        </div>
    );
}
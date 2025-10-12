import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
import { getLatestEssayForDashboard } from '@/app/dashboard/applications/write/actions';
import { getStudentTestDashboardData, getCampaignsForStudent } from '@/app/dashboard/applications/test/actions';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

const getWelcomeMessage = (pronoun: string | null | undefined): string => {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) {
    greeting = 'Bom dia';
  } else if (hour < 18) {
    greeting = 'Boa tarde';
  } else {
    greeting = 'Boa noite';
  }
  return `${greeting}! Que bom te ver de volta ao seu Hub.`;
};

const DashboardCard = ({ title, latestItem, buttonText, link, icon, emptyText }: { title: string; latestItem: { name: string; score: number | null } | null; buttonText: string; link: string; icon: string; emptyText: string; }) => (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <i className={`fas ${icon} text-xl text-royal-blue mr-3`}></i>
        <h2 className="text-lg font-bold text-dark-text dark:text-white">{title}</h2>
      </div>
      <div className="flex-grow">
        {latestItem ? (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            <p className="text-sm text-dark-text-muted">Último resultado:</p>
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-dark-text dark:text-white truncate pr-2">{latestItem.name}</span>
              <span className="font-bold text-lg text-royal-blue">{latestItem.score !== null ? `${latestItem.score.toFixed(0)}%` : 'N/A'}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-dark-text-muted">{emptyText}</p>
        )}
      </div>
      <Link href={link} className="mt-6 w-full bg-royal-blue text-white text-center font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
        {buttonText}
      </Link>
    </div>
);

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { return null; }

    const [profileResult, essayRes, testRes, campaignsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, pronoun, target_exam').eq('id', user.id).single(),
        getLatestEssayForDashboard(),
        getStudentTestDashboardData(),
        getCampaignsForStudent()
    ]);

    const profile = profileResult.data;
    const welcomeMessage = getWelcomeMessage(profile?.pronoun);
    const campaigns = campaignsRes.data;

    const latestEssay = essayRes.data ? {
      // @ts-ignore
      name: essayRes.data.prompts.title,
      // @ts-ignore
      score: essayRes.data.final_grade,
    } : null;

    const latestTest = testRes.data?.recentAttempts?.[0] ? {
      name: testRes.data.recentAttempts[0].tests.title,
      score: testRes.data.recentAttempts[0].score,
    } : null;

    let examDate: { name: string, exam_date: string } | null = null;
    if (profile?.target_exam) {
        const { data } = await supabase.from('exam_dates').select('name, exam_date').eq('name', profile.target_exam).single();
        examDate = data;
    }

    const fullName = profile?.full_name || 'Usuário';

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-1">Olá, {fullName.split(' ')[0]}!</h1>
            <p className="text-text-muted dark:text-gray-400">{welcomeMessage}</p>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <CountdownWidget targetExam={examDate?.name} examDate={examDate?.exam_date} />
                </div>

                {campaigns && campaigns.length > 0 && (
                  <div className="lg:col-span-3 bg-royal-blue text-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <i className="fas fa-trophy text-yellow-300 text-3xl"></i>
                      <div>
                        <h2 className="text-lg font-bold">Campanha Ativa: {campaigns[0].title}</h2>
                        <p className="text-sm opacity-90">
                          Prepare-se para o SAEB 2025 e concorra a prêmios! A campanha termina em {new Date(campaigns[0].end_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.
                        </p>
                        <Link href="/recursos/termos-campanha" target="_blank" className="text-xs text-white underline font-semibold hover:opacity-80 mt-2 inline-block">
                            Confira as regras e termos da competição
                        </Link>
                      </div>
                    </div>
                    <Link href="/dashboard/applications/test" className="mt-4 md:mt-0 w-full md:w-auto bg-white text-royal-blue text-center font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0">
                      Participar Agora
                    </Link>
                  </div>
                )}

                <DashboardCard
                    title="Facillit Write"
                    latestItem={latestEssay}
                    buttonText="Acessar Módulo de Redação"
                    link="/dashboard/applications/write"
                    icon="fa-pen-alt"
                    emptyText="Nenhuma redação enviada recentemente."
                />
                <DashboardCard
                    title="Facillit Test"
                    latestItem={latestTest}
                    buttonText="Acessar Módulo de Testes"
                    link="/dashboard/applications/test"
                    icon="fa-check-square"
                    emptyText="Nenhum simulado realizado recentemente."
                />

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow dark:bg-gray-800 dark:border-yellow-600">
                    <div className="flex">
                        <div className="flex-shrink-0"><i className="fas fa-exclamation-triangle text-yellow-500"></i></div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Esta plataforma está em desenvolvimento. Bugs podem acontecer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard'; 
import { 
  getPrompts, 
  getStudentStatistics, 
  calculateWritingStreak, 
  getUserStateRank, 
  getFrequentErrors, 
  getCurrentEvents,
  getCorrectedEssaysForTeacher,
  getAdminDashboardData // Importa a nova action
} from './actions';

export default async function WritePage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // ROTA PARA ADMINISTRADOR
  if (profile.user_category === 'administrator') {
    const adminDataResult = await getAdminDashboardData();
    if (adminDataResult.error || !adminDataResult.data) {
       return <div>Erro: {adminDataResult.error || 'Não foi possível carregar os dados do administrador.'}</div>;
    }
  }

  // ROTA PARA ALUNO
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    const [
        essaysResult, 
        promptsResult, 
        statsResult, 
        streakResult, 
        rankResult,
        frequentErrorsResult,
        currentEventsResult,
    ] = await Promise.all([
      supabase
        .from('essays')
        .select('id, title, status, submitted_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false, nullsFirst: true }),
      getPrompts(),
      getStudentStatistics(),
      calculateWritingStreak(),
      getUserStateRank(),
      getFrequentErrors(),
      getCurrentEvents(),
    ]);

    return (
      <StudentDashboard 
        initialEssays={essaysResult.data || []} 
        prompts={promptsResult.data || []}
        statistics={statsResult.data ?? null}
        streak={streakResult.data || 0}
        rankInfo={rankResult.data}
        frequentErrors={frequentErrorsResult.data || []}
        currentEvents={currentEventsResult.data || []}
      />
    );
  }

  // ROTA PARA PROFESSOR/GESTOR
  if (['professor', 'gestor'].includes(profile.user_category || '')) {
     const [pendingEssaysResult, correctedEssaysResult] = await Promise.all([
        supabase
          .from('essays')
          .select('id, title, submitted_at, profiles(full_name)')
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: true }),
        getCorrectedEssaysForTeacher()
     ]);

    return (
        <TeacherDashboard 
            pendingEssays={pendingEssaysResult.data || []} 
            correctedEssays={correctedEssaysResult.data || []}
        />
    );
  }

  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Redação</h1>
        <p>O seu perfil não tem acesso a este módulo.</p>
    </div>
  );
}
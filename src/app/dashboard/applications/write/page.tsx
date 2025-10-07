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
  getCorrectedEssaysForTeacher
} from './actions';

export default async function WritePage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category, target_exam') // Adicionado 'target_exam'
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
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
    
    // Busca a data do vestibular se o usuário tiver um selecionado
    let examDate: { name: string, exam_date: string } | null = null;
    if (profile?.target_exam) {
        const { data } = await supabase
            .from('exam_dates')
            .select('name, exam_date')
            .eq('name', profile.target_exam)
            .single();
        examDate = data;
    }

    return (
      <StudentDashboard
        initialEssays={essaysResult.data || []}
        prompts={promptsResult.data || []}
        statistics={statsResult.data ?? null}
        streak={streakResult.data || 0}
        rankInfo={rankResult.data}
        frequentErrors={frequentErrorsResult.data || []}
        currentEvents={currentEventsResult.data || []}
        targetExam={examDate?.name}
        examDate={examDate?.exam_date}
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

    const pendingEssays = pendingEssaysResult.data?.map(essay => ({
      ...essay,
      profiles: Array.isArray(essay.profiles) ? essay.profiles[0] : essay.profiles,
    })) || [];

    const correctedEssays = correctedEssaysResult.data?.map(essay => ({
        ...essay,
        profiles: Array.isArray(essay.profiles) ? essay.profiles[0] : essay.profiles,
    })) || [];


    return (
        <TeacherDashboard
            pendingEssays={pendingEssays}
            correctedEssays={correctedEssays}
        />
    );
  }

  // Fallback para qualquer outro perfil
  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Redação</h1>
        <p>O seu perfil não tem acesso a este módulo.</p>
    </div>
  );
}
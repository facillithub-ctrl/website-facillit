import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
// CORREÇÃO APLICADA AQUI: caminho relativo para o alias
import { getPrompts, getStudentStatistics, calculateWritingStreak, getUserStateRank } from '@/app/dashboard/applications/write/actions';

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

  // Se o usuário for um aluno ou vestibulando
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    // Busca todos os dados de forma paralela para otimizar
    const [
        essaysResult, 
        promptsResult, 
        statsResult, 
        streakResult, 
        rankResult
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
    ]);

    return (
      <StudentDashboard 
        initialEssays={essaysResult.data || []} 
        prompts={promptsResult.data || []}
        statistics={statsResult.data}
        streak={streakResult.data || 0}
        rankInfo={rankResult.data}
      />
    );
  }

  // Se o usuário for um professor ou gestor
  if (['professor', 'gestor'].includes(profile.user_category || '')) {
     const { data: pendingEssays } = await supabase
        .from('essays')
        .select('id, title, submitted_at, profiles(full_name)')
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true });

    return <TeacherDashboard pendingEssays={pendingEssays || []} />;
  }

  // Fallback para outros tipos de usuário
  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Redação</h1>
        <p>Seu perfil não tem acesso a este módulo.</p>
    </div>
  );
}
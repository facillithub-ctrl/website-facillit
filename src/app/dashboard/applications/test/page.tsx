import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import {
    getTestsForTeacher,
    getStudentTestDashboardData,
    getAvailableTestsForStudent,
    getKnowledgeTestsForDashboard
} from './actions';
import type { UserProfile } from '../../types';

export default async function TestPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // ROTA PARA ALUNO
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    const [dashboardDataRes, availableTestsRes, knowledgeTestsRes] = await Promise.all([
      getStudentTestDashboardData(),
      getAvailableTestsForStudent(),
      getKnowledgeTestsForDashboard()
    ]);

    // Adiciona logs no servidor para ajudar a depurar o que está sendo recebido
    if (dashboardDataRes.error) {
        console.error("Erro na página TestPage ao buscar getStudentTestDashboardData:", dashboardDataRes.error);
    }
    if (availableTestsRes.error) {
        console.error("Erro na página TestPage ao buscar getAvailableTestsForStudent:", availableTestsRes.error);
    }
    if (knowledgeTestsRes.error) {
        console.error("Erro na página TestPage ao buscar getKnowledgeTestsForDashboard:", knowledgeTestsRes.error);
    }

    return (
      <StudentTestDashboard
        // Garante que `null` seja passado se `data` for undefined, prevenindo erros
        dashboardData={dashboardDataRes.data ?? null}
        initialAvailableTests={availableTestsRes.data || []}
        knowledgeTests={knowledgeTestsRes.data || []}
      />
    );
  }

  // ROTA PARA PROFESSOR (GLOBAL E INSTITUCIONAL) E GESTOR/ADMIN
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(profile.user_category || '')) {
    const { data: teacherTests, error } = await getTestsForTeacher();

    if (error) {
        console.error("Erro na página TestPage ao buscar getTestsForTeacher:", error);
    }

    return <TeacherTestDashboard initialTests={teacherTests || []} userProfile={profile as UserProfile} />;
  }

  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Testes</h1>
        <p>Seu perfil não tem acesso a este módulo no momento.</p>
    </div>
  );
}
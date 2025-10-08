import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import { getTestsForTeacher, getStudentTestDashboardData } from './actions';

export default async function TestPage() {
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

  // ROTA PARA ALUNO
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    // Chama a nova action que busca todos os dados
    const { data: dashboardData } = await getStudentTestDashboardData();
    return <StudentTestDashboard dashboardData={dashboardData} />;
  }

  // ROTA PARA PROFESSOR
  if (['professor', 'gestor', 'administrator'].includes(profile.user_category || '')) {
    const { data: teacherTests } = await getTestsForTeacher();
    return <TeacherTestDashboard initialTests={teacherTests || []} />;
  }

  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Testes</h1>
        <p>Seu perfil não tem acesso a este módulo no momento.</p>
    </div>
  );
}
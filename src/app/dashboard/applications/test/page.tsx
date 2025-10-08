import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import { getTestsForTeacher, getTestsForStudent } from './actions'; // Importa ambas as funções

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

  // Rota para Aluno: Busca os testes públicos
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    const { data: studentTests } = await getTestsForStudent();
    return <StudentTestDashboard initialTests={studentTests || []} />;
  }

  // Rota para Professor/Gestor: Busca os testes criados por ele
  if (['professor', 'gestor', 'administrator'].includes(profile.user_category || '')) {
    const { data: teacherTests } = await getTestsForTeacher();
    return <TeacherTestDashboard initialTests={teacherTests || []} />;
  }

  // Fallback para qualquer outro tipo de perfil
  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Testes</h1>
        <p>Seu perfil não tem acesso a este módulo no momento.</p>
    </div>
  );
}
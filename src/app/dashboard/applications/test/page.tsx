import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';
import { getTestsForTeacher } from './actions'; // Importa a nova função

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

  // Renderiza a dashboard apropriada com base no perfil do usuário
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    // Para o aluno, por enquanto, não buscamos nenhum teste
    return <StudentTestDashboard initialTests={[]} />;
  }

  if (['professor', 'gestor', 'administrator'].includes(profile.user_category || '')) {
    // Busca os testes criados pelo professor/gestor
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
import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';

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
    return <StudentTestDashboard />;
  }

  if (['professor', 'gestor', 'administrator'].includes(profile.user_category || '')) {
    return <TeacherTestDashboard />;
  }

  // Fallback para qualquer outro tipo de perfil
  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Testes</h1>
        <p>Seu perfil não tem acesso a este módulo no momento.</p>
    </div>
  );
}
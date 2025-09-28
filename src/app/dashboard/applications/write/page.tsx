import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { getPrompts } from './actions';

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

  // Se for aluno ou vestibulando, busca as redações e os temas
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    const { data: essays } = await supabase
        .from('essays')
        .select('id, title, status, submitted_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false, nullsFirst: true });
    
    const { data: prompts } = await getPrompts();

    return <StudentDashboard initialEssays={essays || []} prompts={prompts || []} />;
  }

  // Se for professor ou gestor, busca as redações pendentes de correção
  if (['professor', 'gestor'].includes(profile.user_category || '')) {
     const { data: pendingEssays } = await supabase
        .from('essays')
        .select('id, title, submitted_at, profiles(full_name)')
        .eq('status', 'submitted')
        // Aqui você poderia adicionar um .eq('organization_id', profile.organization_id) no futuro
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
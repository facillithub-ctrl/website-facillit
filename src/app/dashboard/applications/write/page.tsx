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

  // If the user is a student or preparing for exams, fetch their essays and prompts
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    const { data: essays } = await supabase
        .from('essays')
        .select('id, title, status, submitted_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false, nullsFirst: true });
    
    const { data: prompts } = await getPrompts();

    return <StudentDashboard initialEssays={essays || []} prompts={prompts || []} />;
  }

  // If the user is a teacher or manager, fetch essays pending correction
  if (['professor', 'gestor'].includes(profile.user_category || '')) {
     const { data: pendingEssays } = await supabase
        .from('essays')
        .select('id, title, submitted_at, profiles(full_name)')
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true });

    // FIX: The incorrect data transformation (.map) was removed here.
    // We now pass the data directly from Supabase to the component.
    return <TeacherDashboard pendingEssays={pendingEssays || []} />;
  }

  // Fallback for other user types
  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Redação</h1>
        <p>Seu perfil não tem acesso a este módulo.</p>
    </div>
  );
}
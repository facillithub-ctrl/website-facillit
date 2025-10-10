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
import type { UserProfile } from '../../types'; // Importar o tipo UserProfile

export default async function TestPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // MODIFICAÇÃO: Buscar o perfil completo do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*') // Busca todos os campos para ter o perfil completo
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
    
    return (
      <StudentTestDashboard 
        dashboardData={dashboardDataRes.data} 
        initialAvailableTests={availableTestsRes.data || []}
        knowledgeTests={knowledgeTestsRes.data || []}
      />
    );
  }

  // ROTA PARA PROFESSOR (GLOBAL E INSTITUCIONAL) E GESTOR/ADMIN
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(profile.user_category || '')) {
    const { data: teacherTests } = await getTestsForTeacher();
    
    // MODIFICAÇÃO: Passar o perfil completo para o dashboard do professor
    return <TeacherTestDashboard initialTests={teacherTests || []} userProfile={profile as UserProfile} />;
  }

  return (
    <div>
        <h1 className="text-2xl font-bold">Módulo de Testes</h1>
        <p>Seu perfil não tem acesso a este módulo no momento.</p>
    </div>
  );
}
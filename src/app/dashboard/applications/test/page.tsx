import { redirect } from 'next/navigation';
import { getStudentTestDashboardData, getTeacherTests, getAvailableTests } from './actions';
import createClient from '@/utils/supabase/server';
import StudentTestDashboard from './components/StudentTestDashboard';
import TeacherTestDashboard from './components/TeacherTestDashboard';

export default async function TestPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Adicionado um retorno mais claro para o caso de perfil não encontrado
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 border rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p>Não conseguimos encontrar seu perfil. Por favor, tente fazer login novamente ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  if (profile.role === 'student') {
    // Busca os dados em paralelo para otimizar o carregamento
    const [dashboardResult, availableTestsResult] = await Promise.all([
      getStudentTestDashboardData(),
      getAvailableTests()
    ]);

    const { data: dashboardData, error: dashboardError } = dashboardResult;
    const { data: availableTests, error: availableTestsError } = availableTestsResult;
    
    // Mesmo se houver um erro no dashboard, a página deve carregar se houver testes disponíveis
    if (availableTestsError && !availableTests) {
       return <div>Erro ao carregar os testes disponíveis. Tente novamente mais tarde.</div>;
    }

    // Passa os dados para o componente, mesmo que `dashboardData` seja nulo por conta de um erro
    return <StudentTestDashboard dashboardData={dashboardData || null} availableTests={availableTests || []} />;
  }

  if (profile.role === 'teacher') {
    const { data: tests, error } = await getTeacherTests();
    if (error) {
      return <div>Erro ao carregar as avaliações: {error}</div>;
    }
    return <TeacherTestDashboard initialTests={tests || []} />;
  }

  return <div>Tipo de usuário desconhecido.</div>;
}
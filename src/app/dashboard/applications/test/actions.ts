"use server";

import createSupabaseServerClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- TIPOS ---
export type QuestionContent = {
  statement: string;
  image_url?: string | null;
  options?: string[];
  correct_option?: number;
};

export type Question = {
  id: string;
  test_id: string;
  question_type: 'multiple_choice' | 'dissertation';
  content: QuestionContent;
  points: number;
};

export type TestWithQuestions = {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  questions: Question[];
};

export type Test = Omit<TestWithQuestions, 'questions'>;

export type TestAttempt = {
  id: string;
  test_id: string;
  student_id: string;
  answers: any[];
  score: number | null; // Pode ser nulo se não corrigido
  started_at: string;
  completed_at: string | null;
};


// --- FUNÇÕES DO PROFESSOR ---

export async function createOrUpdateTest(testData: { title: string; description: string | null; questions: Omit<Question, 'id' | 'test_id'>[], is_public: boolean }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: testResult, error: testError } = await supabase
    .from('tests')
    .insert({
      title: testData.title,
      description: testData.description,
      created_by: user.id,
      is_public: testData.is_public,
      // subject: 'Matemática' // Exemplo: Adicionar matéria ao criar teste
    })
    .select()
    .single();

  if (testError) return { error: `Erro ao criar avaliação: ${testError.message}` };

  if (testData.questions.length > 0) {
    const questionsToInsert = testData.questions.map(q => ({ test_id: testResult.id, ...q }));
    const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);
    if (questionsError) {
      await supabase.from('tests').delete().eq('id', testResult.id);
      return { error: `Erro ao salvar questões: ${questionsError.message}` };
    }
  }

  revalidatePath('/dashboard/applications/test');
  return { data: testResult, error: null };
}

export async function getTestsForTeacher() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Usuário não autenticado." };
  const { data, error } = await supabase.from('tests').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getTestWithQuestions(testId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('tests').select('*, questions(*)').eq('id', testId).single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}


// --- FUNÇÕES DO ALUNO ---

export async function getTestsForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('tests').select('id, title, description, created_at, subject, profiles (full_name)').eq('is_public', true).order('created_at', { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// NOVA FUNÇÃO para buscar todos os dados da dashboard do aluno de uma vez
export async function getStudentTestDashboardData() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    // 1. Chamar a função de estatísticas
    const { data: stats, error: statsError } = await supabase.rpc('get_student_test_stats', { p_student_id: user.id });
    if (statsError) return { data: null, error: `Erro ao buscar estatísticas: ${statsError.message}` };

    // 2. Chamar a função de performance por matéria
    const { data: performance, error: perfError } = await supabase.rpc('get_student_performance_by_subject', { p_student_id: user.id });
    if (perfError) return { data: null, error: `Erro ao buscar performance: ${perfError.message}` };
    
    // 3. Buscar os últimos simulados feitos
    const { data: recent, error: recentError } = await supabase
        .from('test_attempts')
        .select('score, completed_at, tests (title, subject)')
        .eq('student_id', user.id)
        .eq('status', 'graded')
        .order('completed_at', { ascending: false })
        .limit(3);
    if (recentError) return { data: null, error: `Erro ao buscar últimos simulados: ${recentError.message}` };

    return {
        data: {
            stats: stats,
            performanceBySubject: performance,
            recentAttempts: recent,
        },
        error: null,
    };
}
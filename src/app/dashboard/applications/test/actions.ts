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
  duration_minutes: number;
  questions: Question[];
};

export type Test = Omit<TestWithQuestions, 'questions'>;

export type TestAttempt = {
  id: string;
  test_id: string;
  student_id: string;
  answers: { questionId: string, answer: number | string | null }[];
  score: number | null;
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
      // TODO: Adicionar campos para 'subject', 'difficulty', etc. no modal de criação
      subject: 'Matemática',
      difficulty: 'Médio',
      duration_minutes: 60,
      points: 100
    })
    .select()
    .single();

  if (testError) return { error: `Erro ao criar avaliação: ${testError.message}` };

  if (testData.questions.length > 0) {
    const questionsToInsert = testData.questions.map(q => ({
      test_id: testResult.id,
      question_type: q.question_type,
      content: q.content,
      points: q.points,
    }));
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
    const { data, error } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();
        
    if (error) return { data: null, error: `Erro ao buscar detalhes do teste: ${error.message}` };
    
    return { data, error: null };
}


// --- FUNÇÕES DO ALUNO ---

// Busca a lista de simulados disponíveis para a tela "Praticar"
export async function getAvailableTestsForStudent() {
    const supabase = await createSupabaseServerClient();

    // Esta query agrega os dados necessários para os cards
    const { data, error } = await supabase
        .from('tests')
        .select(`
            id,
            title,
            subject,
            duration_minutes,
            difficulty,
            points,
            questions ( count ),
            test_attempts ( score )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar testes disponíveis:", error);
        return { data: null, error: error.message };
    }

    // Mapeia os dados para o formato do componente
    const formattedData = data.map(test => {
        const attempts = test.test_attempts;
        const total_attempts = attempts.length;
        const avg_score = total_attempts > 0
            ? attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / total_attempts
            : 0;

        return {
            id: test.id,
            title: test.title,
            subject: test.subject,
            question_count: test.questions[0]?.count || 0,
            duration_minutes: test.duration_minutes || 60,
            difficulty: test.difficulty || 'Médio',
            points: test.points || 0,
            avg_score: avg_score / 10, // Converte para escala 0-10
            total_attempts: total_attempts,
        };
    });

    return { data: formattedData, error: null };
}


// Busca todos os dados da dashboard de uma vez
export async function getStudentTestDashboardData() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const [statsRes, performanceRes, recentRes] = await Promise.all([
        supabase.rpc('get_student_test_stats', { p_student_id: user.id }),
        supabase.rpc('get_student_performance_by_subject', { p_student_id: user.id }),
        supabase.from('test_attempts').select('score, completed_at, tests (title, subject)').eq('student_id', user.id).eq('status', 'graded').order('completed_at', { ascending: false }).limit(3)
    ]);

    if (statsRes.error) return { data: null, error: `Erro (stats): ${statsRes.error.message}` };
    if (performanceRes.error) return { data: null, error: `Erro (performance): ${performanceRes.error.message}` };
    if (recentRes.error) return { data: null, error: `Erro (recent): ${recentRes.error.message}` };
    
    if (statsRes.data.simuladosFeitos === 0) {
        return { data: null, error: null };
    }

    return {
        data: {
            stats: statsRes.data,
            performanceBySubject: performanceRes.data,
            recentAttempts: recentRes.data,
        },
        error: null,
    };
}

// Salva a tentativa do aluno no banco
export async function submitTestAttempt(attemptData: Omit<TestAttempt, 'id' | 'student_id' | 'started_at' | 'completed_at' | 'score'> & { score: number }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };
  
    const { data, error } = await supabase
      .from('test_attempts')
      .insert({
        ...attemptData,
        student_id: user.id,
        status: 'graded', // Marcamos como corrigido
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
  
    if (error) return { error: `Erro ao salvar tentativa: ${error.message}` };

    revalidatePath('/dashboard/applications/test');
    return { data };
}
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
  is_knowledge_test?: boolean;
  related_prompt_id?: string | null;
};

export type Test = Omit<TestWithQuestions, 'questions'>;

export type StudentAnswer = { questionId: string, answer: number | string | null };

export type TestAttempt = {
  id: string;
  test_id: string;
  student_id: string;
  answers: StudentAnswer[];
  score: number | null;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'graded';
};


// --- FUNÇÕES DO PROFESSOR ---

export async function createOrUpdateTest(testData: { title: string; description: string | null; questions: Omit<Question, 'id' | 'test_id'>[], is_public: boolean, is_knowledge_test: boolean, related_prompt_id: string | null }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const totalPoints = testData.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const { data: testResult, error: testError } = await supabase
    .from('tests')
    .insert({
      title: testData.title,
      description: testData.description,
      created_by: user.id,
      is_public: testData.is_public,
      subject: 'Geral', // Pode ser aprimorado para pegar do form
      difficulty: 'Médio', // Pode ser aprimorado
      duration_minutes: 60, // Pode ser aprimorado
      points: totalPoints,
      is_knowledge_test: testData.is_knowledge_test,
      related_prompt_id: testData.related_prompt_id,
    })
    .select()
    .single();

  if (testError) {
    console.error("Erro ao criar avaliação:", testError);
    return { error: `Erro ao criar avaliação: ${testError.message}` };
  }

  if (testData.questions.length > 0) {
    const questionsToInsert = testData.questions.map(q => ({
      test_id: testResult.id,
      question_type: q.question_type,
      content: q.content,
      points: q.points,
    }));
    const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);
    if (questionsError) {
      console.error("Erro ao salvar questões:", questionsError);
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

  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar testes do professor:", error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function getTestWithQuestions(testId: string): Promise<{ data: TestWithQuestions | null; error: string | null; }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();
        
    if (error) {
        console.error(`Erro ao buscar detalhes do teste ${testId}:`, error);
        return { data: null, error: `Erro ao buscar detalhes do teste: ${error.message}` };
    }
    
    return { data, error: null };
}


// --- FUNÇÕES DO ALUNO ---

export async function getAvailableTestsForStudent(filters: { category?: string } = {}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Usuário não autenticado" };

    let query = supabase
        .from('tests')
        .select(`
            id, title, subject, duration_minutes, difficulty, points,
            questions ( count ),
            test_attempts!left(student_id)
        `)
        .eq('is_public', true)
        .eq('is_knowledge_test', false) // Apenas simulados normais
        .eq('test_attempts.student_id', user.id); // Traz a tentativa se existir para o filtro

    if (filters.category && filters.category !== 'Todos') {
        query = query.eq('subject', filters.category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar testes disponíveis:", error);
        return { data: null, error: error.message };
    }

    const formattedData = data.map(test => {
        const hasAttempted = test.test_attempts.length > 0;
        return {
            id: test.id,
            title: test.title,
            subject: test.subject,
            question_count: test.questions[0]?.count || 0,
            duration_minutes: test.duration_minutes || 60,
            difficulty: test.difficulty || 'Médio',
            points: test.points || 0,
            hasAttempted, // Informa a UI se o teste já foi feito
        };
    });

    return { data: formattedData, error: null };
}

export async function getStudentTestDashboardData() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const [statsRes, performanceRes, recentRes] = await Promise.all([
        supabase.rpc('get_student_test_stats', { p_student_id: user.id }),
        supabase.rpc('get_student_performance_by_subject', { p_student_id: user.id }),
        supabase.from('test_attempts').select('score, completed_at, tests (title, subject)').eq('student_id', user.id).eq('status', 'graded').order('completed_at', { ascending: false }).limit(3)
    ]);

    if (statsRes.error || performanceRes.error || recentRes.error) {
        console.error("Erros ao buscar dados do dashboard:", { stats: statsRes.error, perf: performanceRes.error, recent: recentRes.error });
        return { data: null, error: 'Erro ao carregar dados do dashboard.' };
    }
    
    if (!statsRes.data || statsRes.data.simuladosFeitos === 0) {
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

export async function submitTestAttempt(
  { test_id, answers }: { test_id: string; answers: StudentAnswer[]; }
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };
  
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('questions (id, question_type, content, points)')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      console.error('Erro ao buscar o teste para correção:', testError);
      return { error: 'Não foi possível encontrar o simulado para correção.' };
    }

    let score = 0;
    const totalPoints = test.questions.reduce((acc, q) => acc + (q.points || 0), 0);
    
    for (const question of test.questions) {
      const studentAnswer = answers.find(a => a.questionId === question.id);
      if (studentAnswer && question.question_type === 'multiple_choice') {
        const correctOption = (question.content as QuestionContent).correct_option;
        if (studentAnswer.answer === correctOption) {
          score += question.points || 0;
        }
      }
    }

    const finalPercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    const { data, error } = await supabase
      .from('test_attempts')
      .insert({
        test_id: test_id,
        student_id: user.id,
        answers: answers,
        score: finalPercentage,
        status: 'graded',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
  
    if (error) {
        if (error.code === '23505') {
            return { error: 'Você já completou este simulado.' };
        }
        console.error('Erro do Supabase ao salvar tentativa:', error);
        return { error: `Erro ao salvar tentativa: ${error.message}` };
    }

    revalidatePath('/dashboard/applications/test');
    return { data };
}

// RESTAURADA
export async function getLatestTestAttemptForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('test_attempts')
    .select('score, tests ( title )')
    .eq('student_id', user.id)
    .eq('status', 'graded')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar última tentativa para o dashboard:", error);
    return { data: null, error: error.message };
  }

  return { data: data, error: null };
}


export async function getKnowledgeTestsForDashboard() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Usuário não autenticado" };
    
    const { data, error } = await supabase
        .from('tests')
        .select(`
            id, title, subject,
            questions ( count ),
            test_attempts!left(student_id)
        `)
        .eq('is_public', true)
        .eq('is_knowledge_test', true)
        .eq('test_attempts.student_id', user.id);

    if (error) {
        console.error("Erro ao buscar testes de conhecimento:", error);
        return { data: null, error: error.message };
    }
    
    const unattempted = data.filter(test => test.test_attempts.length === 0);
    return { data: unattempted, error: null };
}

export async function getStudentResultsHistory() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const { data, error } = await supabase
        .from('test_attempts')
        .select(`
            id, completed_at, score,
            tests (title, subject, questions(count))
        `)
        .eq('student_id', user.id)
        .eq('status', 'graded')
        .order('completed_at', { ascending: false });
        
    if (error) {
        console.error("Erro ao buscar histórico de resultados:", error);
        return { data: null, error: error.message };
    }
    
    return { data, error: null };
}

export async function getQuickTest() {
    // ... (implementação existente)
}
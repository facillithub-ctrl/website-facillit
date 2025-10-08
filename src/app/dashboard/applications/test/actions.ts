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
      subject: 'Geral',
      difficulty: 'Médio',
      duration_minutes: 60,
      points: testData.questions.reduce((sum, q) => sum + q.points, 0)
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
      // Rollback: deleta o teste se as questões falharem
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

export async function getAvailableTestsForStudent() {
    const supabase = await createSupabaseServerClient();

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

export async function getStudentTestDashboardData() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const [statsRes, performanceRes, recentRes] = await Promise.all([
        supabase.rpc('get_student_test_stats', { p_student_id: user.id }),
        supabase.rpc('get_student_performance_by_subject', { p_student_id: user.id }),
        supabase.from('test_attempts').select('score, completed_at, tests (title, subject)').eq('student_id', user.id).eq('status', 'graded').order('completed_at', { ascending: false }).limit(3)
    ]);

    if (statsRes.error) {
        console.error("Erro na RPC get_student_test_stats:", statsRes.error);
        return { data: null, error: `Erro (stats): ${statsRes.error.message}` };
    }
    if (performanceRes.error) {
        console.error("Erro na RPC get_student_performance_by_subject:", performanceRes.error);
        return { data: null, error: `Erro (performance): ${performanceRes.error.message}` };
    }
    if (recentRes.error) {
        console.error("Erro ao buscar tentativas recentes:", recentRes.error);
        return { data: null, error: `Erro (recent): ${recentRes.error.message}` };
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

/**
 * Salva a tentativa do aluno, calculando a nota de forma segura no servidor.
 */
export async function submitTestAttempt(
  { test_id, answers }: { test_id: string; answers: StudentAnswer[]; }
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };
  
    // 1. Buscar as questões e respostas corretas do teste do banco de dados
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('questions (id, question_type, content, points)')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      console.error('Erro ao buscar o teste para correção:', testError);
      return { error: 'Não foi possível encontrar o simulado para correção.' };
    }

    // 2. Calcular a pontuação de forma segura no servidor
    let score = 0;
    const totalPoints = test.questions.reduce((acc, q) => acc + q.points, 0);
    
    for (const question of test.questions) {
      const studentAnswer = answers.find(a => a.questionId === question.id);

      if (studentAnswer && question.question_type === 'multiple_choice') {
        // Compara a resposta do aluno com a resposta correta vinda do banco de dados
        if (studentAnswer.answer === question.content.correct_option) {
          score += question.points;
        }
      }
      // Futuramente, a lógica para questões dissertativas pode ser adicionada aqui
    }

    const finalPercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    // 3. Inserir a tentativa do aluno com a nota já calculada
    const { data, error } = await supabase
      .from('test_attempts')
      .insert({
        test_id: test_id,
        student_id: user.id,
        answers: answers, // Armazena as respostas do aluno
        score: finalPercentage, // Armazena a pontuação calculada
        status: 'graded', // Define o status como 'corrigido'
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
  
    if (error) {
        // Log detalhado do erro no servidor
        console.error('Erro do Supabase ao salvar tentativa:', error);
        return { error: `Erro ao salvar tentativa: ${error.message}` };
    }

    revalidatePath('/dashboard/applications/test');
    return { data };
}
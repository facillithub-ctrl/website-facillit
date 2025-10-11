"use server";

import createSupabaseServerClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- TIPOS ---
export type QuestionContent = {
  base_text?: string | null;
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
  thematic_axis?: string | null;
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
  cover_image_url?: string | null;
  collection?: string | null;
  class_id?: string | null;
};

export type Test = Omit<TestWithQuestions, 'questions'>;
export type StudentAnswerPayload = { questionId: string, answer: number | string | null, time_spent: number };
export type TestAttempt = {
  id: string;
  test_id: string;
  student_id: string;
  score: number | null;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'graded';
  time_spent_seconds: number | null;
};

export type Campaign = {
    id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    created_by: string;
    organization_id: string | null;
    campaign_tests: { test_id: string }[];
};

// NOVO TIPO: Define a estrutura de uma campanha para o aluno
export type StudentCampaign = {
    id: string;
    title: string;
    description: string | null;
    end_date: string;
    tests: {
        id: string;
        title: string;
        subject: string | null;
        question_count: number;
    }[];
};


// --- FUNÇÕES DO PROFESSOR ---

export async function createOrUpdateTest(testData: {
  title: string;
  description: string | null;
  questions: Omit<Question, 'id' | 'test_id'>[],
  is_public: boolean,
  is_knowledge_test: boolean,
  related_prompt_id: string | null,
  cover_image_url: string | null,
  collection: string | null,
  class_id: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const totalPoints = testData.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const isPublicTest = testData.class_id ? false : testData.is_public;

  const { data: testResult, error: testError } = await supabase
    .from('tests')
    .insert({
      title: testData.title,
      description: testData.description,
      created_by: user.id,
      is_public: isPublicTest,
      subject: 'Geral',
      difficulty: 'Médio',
      duration_minutes: 60,
      points: totalPoints,
      is_knowledge_test: testData.is_knowledge_test,
      related_prompt_id: testData.related_prompt_id,
      cover_image_url: testData.cover_image_url,
      collection: testData.collection,
      class_id: testData.class_id,
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
      thematic_axis: q.thematic_axis
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

export async function getClassAnalytics(classId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_class_analytics', { p_class_id: classId });

    if (error) {
        console.error(`Error fetching analytics for class ${classId}:`, error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

export async function createCampaign(campaignData: { title: string, description: string | null, start_date: string, end_date: string, test_ids: string[] }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

    const { test_ids, ...campaignDetails } = campaignData;

    const { data: newCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
            title: campaignDetails.title,
            description: campaignDetails.description,
            start_date: campaignDetails.start_date,
            end_date: campaignDetails.end_date,
            created_by: user.id,
            organization_id: profile?.organization_id,
        })
        .select()
        .single();
    
    if (campaignError) {
        return { error: `Erro ao criar campanha: ${campaignError.message}` };
    }

    if (test_ids && test_ids.length > 0) {
        const testsToLink = test_ids.map(test_id => ({
            campaign_id: newCampaign.id,
            test_id: test_id,
        }));
        const { error: linkError } = await supabase.from('campaign_tests').insert(testsToLink);
        if (linkError) {
            await supabase.from('campaigns').delete().eq('id', newCampaign.id);
            return { error: `Erro ao associar testes à campanha: ${linkError.message}` };
        }
    }

    revalidatePath('/dashboard/applications/test');
    return { data: newCampaign, error: null };
}

export async function getCampaignsForTeacher() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const { data, error } = await supabase
        .from('campaigns')
        .select('*, campaign_tests(test_id)')
        .eq('created_by', user.id)
        .order('start_date', { ascending: false });

    if (error) {
        return { data: null, error: `Erro ao buscar campanhas: ${error.message}` };
    }
    return { data, error: null };
}


// --- FUNÇÕES DO ALUNO ---

// ✅ NOVA FUNÇÃO ADICIONADA: Busca as campanhas ativas para o aluno.
export async function getCampaignsForStudent() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    const { data, error } = await supabase.rpc('get_campaigns_for_student', { p_student_id: user.id });

    if (error) {
        console.error("Erro ao chamar RPC get_campaigns_for_student:", error);
        return { data: null, error: error.message };
    }
    return { data: data as StudentCampaign[], error: null };
}

export async function getAvailableTestsForStudent() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Usuário não autenticado" };

    const { data, error } = await supabase.rpc('get_available_tests_for_student', { p_student_id: user.id });

    if (error) {
        console.error("Erro ao chamar RPC get_available_tests_for_student:", error);
        return { data: null, error: error.message };
    }

    const formattedData = data.map((test: any) => ({
      id: test.id,
      title: test.title,
      subject: test.subject,
      question_count: test.question_count,
      duration_minutes: test.duration_minutes,
      difficulty: test.difficulty,
      points: test.points,
      avg_score: test.avg_score,
      total_attempts: test.total_attempts,
      hasAttempted: test.has_attempted,
      cover_image_url: test.cover_image_url,
      collection: test.collection,
      class_id: test.class_id,
    }));
    
    const globalTests = formattedData.filter((t: any) => !t.class_id);
    const classTests = formattedData.filter((t: any) => t.class_id);

    return { data: { globalTests, classTests }, error: null };
}

export async function submitTestAttempt(
  { test_id, answers, time_spent }: { test_id: string; answers: StudentAnswerPayload[], time_spent: number }
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

    const { data: attempt, error: attemptError } = await supabase
        .from('test_attempts')
        .insert({
            test_id: test_id,
            student_id: user.id,
            status: 'completed',
            completed_at: new Date().toISOString(),
            time_spent_seconds: time_spent
        })
        .select('id')
        .single();
    
    if (attemptError) {
        console.error("Erro ao criar registro de tentativa:", attemptError);
        return { error: `Erro ao iniciar salvamento: ${attemptError.message}` };
    }

    let correctCount = 0;
    const answersToInsert = answers.map(studentAnswer => {
        const question = test.questions.find(q => q.id === studentAnswer.questionId);
        let isCorrect = false;
        if (question && question.question_type === 'multiple_choice') {
            const correctOption = (question.content as QuestionContent).correct_option;
            if (studentAnswer.answer === correctOption) {
                isCorrect = true;
                correctCount++;
            }
        }
        return {
            attempt_id: attempt.id,
            question_id: studentAnswer.questionId,
            student_id: user.id,
            answer: studentAnswer.answer,
            is_correct: isCorrect,
            time_spent_seconds: studentAnswer.time_spent,
        };
    });

    const { error: answersError } = await supabase.from('student_answers').insert(answersToInsert);

    if(answersError) {
        console.error("Erro ao salvar respostas individuais:", answersError);
        await supabase.from('test_attempts').delete().eq('id', attempt.id);
        return { error: `Erro ao salvar respostas: ${answersError.message}`};
    }

    const finalScore = test.questions.length > 0 ? Math.round((correctCount / test.questions.length) * 100) : 0;
    
    const { error: updateError } = await supabase
        .from('test_attempts')
        .update({ score: finalScore, status: 'graded' })
        .eq('id', attempt.id);

    if (updateError) {
        console.error("Erro ao atualizar o score final:", updateError);
        return { error: `Erro ao finalizar e calcular a nota: ${updateError.message}`};
    }

    revalidatePath('/dashboard/applications/test');
    return { data: { success: true, attemptId: attempt.id } };
}

export async function getStudentTestDashboardData() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado.' };

    const { data, error } = await supabase.rpc('get_student_test_dashboard_stats', { p_student_id: user.id });

    if(error) {
        console.error("Erro ao buscar dados do dashboard do aluno via RPC:", error);
        return { data: null, error: error.message };
    }
    
    if(!data || !data.stats || data.stats.simuladosFeitos === 0) {
        return { data: null, error: null };
    }

    return { data, error: null };
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
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_random_questions', { p_limit: 10 });
    
    if (error) {
        console.error("Erro ao buscar teste rápido:", error);
        return { data: null, error: "Não foi possível carregar as questões para o teste rápido." };
    }

    const quickTest: TestWithQuestions = {
        id: 'quick-test',
        title: 'Teste Rápido',
        description: '10 questões aleatórias para testar seus conhecimentos.',
        created_by: 'system',
        created_at: new Date().toISOString(),
        duration_minutes: 15,
        questions: data
    };

    return { data: quickTest, error: null };
}
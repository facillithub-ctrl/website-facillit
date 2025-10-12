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
  serie?: string | null;
  test_type: 'avaliativo' | 'pesquisa';
  hasAttempted?: boolean;
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

export type StudentCampaign = {
    campaign_id: string;
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


// --- FUNÇÕES DE PROFESSOR E DIRETOR ---
async function isTeacherOrHigher() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_category')
        .eq('id', user.id)
        .single();
    
    return ['professor', 'diretor', 'administrator'].includes(profile?.user_category || '');
}

export async function createOrUpdateTest(testData: {
  id?: string;
  title: string;
  description: string | null;
  questions: Omit<Question, 'id' | 'test_id'>[],
  is_public: boolean,
  is_knowledge_test: boolean,
  related_prompt_id: string | null,
  cover_image_url: string | null,
  collection: string | null,
  class_id: string | null;
  serie: string | null;
  test_type: 'avaliativo' | 'pesquisa';
}) {
  if (!(await isTeacherOrHigher())) return { error: 'Acesso não autorizado.' };
  
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data: testResult, error: testError } = await supabase
    .from('tests')
    .upsert({
      id: testData.id,
      title: testData.title,
      description: testData.description,
      created_by: user.id,
      is_public: testData.class_id ? false : testData.is_public,
      is_knowledge_test: testData.is_knowledge_test,
      related_prompt_id: testData.related_prompt_id,
      cover_image_url: testData.cover_image_url,
      collection: testData.collection,
      class_id: testData.class_id,
      serie: testData.serie,
      test_type: testData.test_type,
      points: testData.test_type === 'avaliativo' ? testData.questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0
    })
    .select()
    .single();

  if (testError) {
    console.error("Erro no upsert da avaliação:", testError);
    return { error: `Erro ao salvar avaliação: ${testError.message}` };
  }

  await supabase.from('questions').delete().eq('test_id', testResult.id);

  if (testData.questions.length > 0) {
    const questionsToInsert = testData.questions.map(q => ({
      test_id: testResult.id,
      question_type: q.question_type,
      content: q.content,
      points: testData.test_type === 'avaliativo' ? q.points : 0,
      thematic_axis: q.thematic_axis
    }));
    const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);
    if (questionsError) {
      console.error("Erro ao salvar questões:", questionsError);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    const { data: testData, error } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();
        
    if (error) {
        console.error(`Erro ao buscar detalhes do teste ${testId}:`, error);
        return { data: null, error: `Erro ao buscar detalhes do teste: ${error.message}` };
    }

    const { data: attemptData } = await supabase
        .from('test_attempts')
        .select('id')
        .eq('student_id', user.id)
        .eq('test_id', testId)
        .limit(1)
        .single();
    
    return { data: { ...testData, hasAttempted: !!attemptData }, error: null };
}


export async function createOrUpdateCampaign(campaignData: {
    id?: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    test_ids: string[];
}) {
    if (!(await isTeacherOrHigher())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    const { test_ids, ...campaignDetails } = campaignData;

    const { data: upsertedCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .upsert({
            id: campaignDetails.id,
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
        return { error: `Erro ao salvar campanha: ${campaignError.message}` };
    }

    await supabase.from('campaign_tests').delete().eq('campaign_id', upsertedCampaign.id);

    if (test_ids && test_ids.length > 0) {
        const testsToLink = test_ids.map(test_id => ({
            campaign_id: upsertedCampaign.id,
            test_id: test_id,
        }));
        const { error: linkError } = await supabase.from('campaign_tests').insert(testsToLink);
        if (linkError) {
            return { error: `Erro ao associar testes à campanha: ${linkError.message}` };
        }
    }

    revalidatePath('/dashboard/applications/test');
    return { data: upsertedCampaign, error: null };
}

export async function deleteCampaign(campaignId: string) {
    if (!(await isTeacherOrHigher())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);

    if (error) {
        return { error: `Erro ao deletar campanha: ${error.message}` };
    }
    revalidatePath('/dashboard/applications/test');
    return { data: { success: true } };
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

export async function submitCampaignConsent(campaignId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { error } = await supabase
        .from('campaign_consent')
        .insert({ student_id: user.id, campaign_id: campaignId });

    if (error) {
        console.error('Erro ao registrar consentimento:', error);
        return { error: 'Não foi possível registrar seu consentimento.' };
    }
    
    return { data: { success: true } };
}

export async function getConsentedCampaignsForStudent() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    const { data, error } = await supabase
        .from('campaign_consent')
        .select('campaign_id')
        .eq('student_id', user.id);

    if (error) {
        return { data: null, error: error.message };
    }

    return { data: data.map(c => c.campaign_id), error: null };
}

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

// ATUALIZADO: getAvailableTestsForStudent para incluir test_type
export async function getAvailableTestsForStudent() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Usuário não autenticado" };

    const { data, error } = await supabase.rpc('get_available_tests_for_student', { p_student_id: user.id });

    if (error) {
        console.error("Erro ao chamar RPC get_available_tests_for_student:", error);
        return { data: null, error: error.message };
    }

    // A CORREÇÃO ESTÁ AQUI: Mapeando o campo 'test_type' que vem do banco de dados
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
      is_campaign_test: test.is_campaign_test,
      test_type: test.test_type, // Garantindo que o tipo seja passado para o front-end
    }));
    
    const globalTests = formattedData.filter((t: any) => !t.class_id && !t.is_campaign_test);
    const classTests = formattedData.filter((t: any) => t.class_id && !t.is_campaign_test);

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
      .select('questions (id, question_type, content, points), test_type')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      console.error('Erro ao buscar o teste para correção:', testError);
      return { error: 'Não foi possível encontrar o simulado para correção.' };
    }
    
    const isSurvey = test.test_type === 'pesquisa';

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
        if (!isSurvey && question && question.question_type === 'multiple_choice') {
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
            is_correct: isSurvey ? null : isCorrect,
            time_spent_seconds: studentAnswer.time_spent,
        };
    });

    const { error: answersError } = await supabase.from('student_answers').insert(answersToInsert);

    if(answersError) {
        console.error("Erro ao salvar respostas individuais:", answersError);
        await supabase.from('test_attempts').delete().eq('id', attempt.id);
        return { error: `Erro ao salvar respostas: ${answersError.message}`};
    }

    if (!isSurvey) {
        const finalScore = test.questions.length > 0 ? Math.round((correctCount / test.questions.length) * 100) : 0;
        const { error: updateError } = await supabase
            .from('test_attempts')
            .update({ score: finalScore, status: 'graded' })
            .eq('id', attempt.id);

        if (updateError) {
            console.error("Erro ao atualizar o score final:", updateError);
            return { error: `Erro ao finalizar e calcular a nota: ${updateError.message}`};
        }
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
        test_type: 'avaliativo',
        questions: data
    };

    return { data: quickTest, error: null };
}

export async function getSurveyResults(testId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: profile } = await supabase.from('profiles').select('user_category, organization_id').eq('id', user.id).single();
    if (!profile) return { error: 'Perfil não encontrado.' };

    const { data: test, error: testError } = await supabase.from('tests').select('organization_id').eq('id', testId).single();
    if (testError) return { error: 'Pesquisa não encontrada.' };
    
    // Validação de permissão
    const isGlobalAdmin = profile.user_category === 'administrator';
    const isDirectorOfOrg = profile.user_category === 'diretor' && profile.organization_id === test.organization_id;

    if (!isGlobalAdmin && !isDirectorOfOrg) {
        return { error: 'Você não tem permissão para ver os resultados desta pesquisa.' };
    }

    // Busca as respostas
    const { data: results, error: resultsError } = await supabase
        .rpc('get_survey_results', { p_test_id: testId });

    if (resultsError) {
        console.error("Erro ao buscar resultados da pesquisa:", resultsError);
        return { error: 'Não foi possível buscar os resultados.' };
    }

    return { data: results };
}
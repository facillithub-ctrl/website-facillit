"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

// --- TIPOS DE DADOS ---

export type Essay = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'corrected';
  submitted_at: string | null;
  prompt_id: string | null;
  student_id: string;
  consent_to_ai_training?: boolean;
  image_submission_url?: string | null;
};

export type Annotation = {
    id: string;
    type: 'text' | 'image';
    comment: string;
    marker: 'erro' | 'acerto' | 'sugestao';
    selection?: string;
    position?: { x: number; y: number; width?: number; height?: number };
};

export type EssayCorrection = {
    id: string;
    essay_id: string;
    corrector_id: string;
    feedback: string;
    grade_c1: number;
    grade_c2: number;
    grade_c3: number;
    grade_c4: number;
    grade_c5: number;
    final_grade: number;
    audio_feedback_url?: string | null;
    annotations?: Annotation[] | null;
    ai_feedback?: AIFeedback | null;
};

export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    image_url: string | null;
    category: string | null;
    publication_date: string | null;
    deadline: string | null;
    cover_image_source: string | null;
    motivational_text_1: string | null;
    motivational_text_2: string | null;
    motivational_text_3_description: string | null;
    motivational_text_3_image_url: string | null;
    motivational_text_3_image_source: string | null;
    difficulty: number | null;
    tags: string[] | null;
};

export type AIFeedback = {
  detailed_feedback: { competency: string; feedback: string }[];
  rewrite_suggestions: { original: string; suggestion: string }[];
  actionable_items: string[];
};


// --- FUNÇÕES DE ALUNO E GERAIS ---
export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  if (essayData.status === 'submitted') {
    if (!essayData.consent_to_ai_training) {
      return { error: 'É obrigatório consentir com os termos para enviar a redação.' };
    }

    if (essayData.prompt_id && !essayData.id) {
      const { data: existingEssay, error: existingError } = await supabase
        .from('essays')
        .select('id')
        .eq('student_id', user.id)
        .eq('prompt_id', essayData.prompt_id)
        .in('status', ['submitted', 'corrected'])
        .limit(1)
        .single();
      
      if (existingEssay) {
        return { error: 'Você já enviou uma redação para este tema.' };
      }
      if (existingError && existingError.code !== 'PGRST116') {
        return { error: 'Erro ao verificar redações existentes.' };
      }
    }
  }

  const { data: upsertedEssay, error: upsertError } = await supabase
    .from('essays')
    .upsert({
      id: essayData.id,
      student_id: user.id,
      title: essayData.title,
      content: essayData.content,
      status: essayData.status,
      prompt_id: essayData.prompt_id,
      submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : essayData.submitted_at,
      consent_to_ai_training: essayData.consent_to_ai_training,
      image_submission_url: essayData.image_submission_url,
    })
    .select()
    .single();

  if (upsertError) return { error: `Erro ao salvar: ${upsertError.message}` };

  if (upsertedEssay && essayData.status === 'draft' && essayData.content) {
    const { count, error: countError } = await supabase
      .from('essay_versions')
      .select('*', { count: 'exact', head: true })
      .eq('essay_id', upsertedEssay.id);

    if (countError) console.error("Erro ao contar versões:", countError.message);

    const { error: versionError } = await supabase
      .from('essay_versions')
      .insert({
        essay_id: upsertedEssay.id,
        content: essayData.content,
        version_number: (count ?? 0) + 1,
      });

    if (versionError) {
      console.error("Erro ao salvar versão da redação:", versionError.message);
    }
  }

  revalidatePath('/dashboard/applications/write');
  revalidatePath('/dashboard');
  return { data: upsertedEssay };
}

export async function getPrompts(): Promise<{ data?: EssayPrompt[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('*');

    if (error) return { error: error.message };
    return { data: data || [] };
}

export async function getEssayDetails(essayId: string): Promise<{ data?: Essay; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essays')
        .select(`*, profiles (full_name)`)
        .eq('id', essayId)
        .single();
    if (error) return { error: `Erro ao buscar detalhes da redação: ${error.message}` };
    return { data };
}

export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at, content, image_submission_url, prompt_id')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) return { error: error.message };
  return { data };
}

export async function getLatestEssayForDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if(error && error.code !== 'PGRST116') return { data: null, error: error.message };
  return { data };
}


// --- FUNÇÕES DE CORREÇÃO ---
type CorrectionWithProfile = EssayCorrection & {
    profiles: { full_name: string | null, verification_badge: string | null };
    ai_feedback: AIFeedback | null;
    essay_correction_errors: { common_errors: { error_type: string } }[];
};

export async function getCorrectionForEssay(essayId: string): Promise<{ data?: CorrectionWithProfile; error?: string }> {
    const supabase = await createSupabaseServerClient();

    // AJUSTE FINAL: Usando .maybeSingle() para evitar o erro do console
    const { data, error } = await supabase
        .from('essay_corrections')
        .select(`
            *,
            profiles (full_name, verification_badge),
            ai_feedback (*),
            essay_correction_errors (
                common_errors (error_type)
            )
        `)
        .eq('essay_id', essayId)
        .maybeSingle(); // Este método busca um registro, mas não retorna erro se não encontrar nenhum (retorna data: null)

    if (error) {
        console.error("Erro ao buscar correção:", error);
        return { error: error.message };
    }

    return { data: data as CorrectionWithProfile || undefined };
}


export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado.' };

    const { ai_feedback, ...humanCorrectionData } = correctionData;

    const { data: correction, error: correctionError } = await supabase
        .from('essay_corrections')
        .insert({
            ...humanCorrectionData,
            corrector_id: user.id
        })
        .select()
        .single();

    if (correctionError) return { error: `Erro ao salvar correção: ${correctionError.message}` };

    if (ai_feedback) {
        const { error: aiError } = await supabase
            .from('ai_feedback')
            .insert({
                essay_id: correctionData.essay_id,
                detailed_feedback: ai_feedback.detailed_feedback,
                rewrite_suggestions: ai_feedback.rewrite_suggestions,
                actionable_items: ai_feedback.actionable_items
            });

        if (aiError) {
            console.error("Erro ao salvar feedback da IA:", aiError);
        }
    }

    const { data: essayData, error: essayError } = await supabase
        .from('essays')
        .update({ status: 'corrected' })
        .eq('id', correctionData.essay_id)
        .select('student_id, title')
        .single();

    if (essayError) return { error: `Erro ao atualizar status da redação: ${essayError.message}` };

    if (essayData && essayData.student_id) {
        await createNotification(
            essayData.student_id,
            'Sua redação foi corrigida!',
            `A redação "${essayData.title || 'sem título'}" já tem um feedback.`,
            `/dashboard/applications/write?essayId=${correctionData.essay_id}`
        );
    }

    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}

// --- FUNÇÕES DE ESTATÍSTICAS E RANKING ---
export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: correctedEssays, error } = await supabase
        .from('essays')
        .select(`submitted_at, essay_corrections (final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5)`)
        .eq('student_id', user.id)
        .eq('status', 'corrected')
        .not('essay_corrections', 'is', null);

    if (error || !correctedEssays || correctedEssays.length === 0) {
        return { data: null, error: error?.message };
    }

    const validCorrections = correctedEssays
        .map(essay => essay.essay_corrections.length > 0 ? { ...essay.essay_corrections[0], submitted_at: essay.submitted_at } : null)
        .filter((correction): correction is NonNullable<typeof correction> => correction !== null && correction.final_grade !== undefined);

    if (validCorrections.length === 0) return { data: null };

    const totalCorrections = validCorrections.length;
    const initialStats = { sum_final_grade: 0, sum_c1: 0, sum_c2: 0, sum_c3: 0, sum_c4: 0, sum_c5: 0 };

    const sums = validCorrections.reduce((acc, current) => {
        acc.sum_final_grade += current.final_grade;
        acc.sum_c1 += current.grade_c1;
        acc.sum_c2 += current.grade_c2;
        acc.sum_c3 += current.grade_c3;
        acc.sum_c4 += current.grade_c4;
        acc.sum_c5 += current.grade_c5;
        return acc;
    }, initialStats);

    const averages = {
        avg_final_grade: sums.sum_final_grade / totalCorrections,
        avg_c1: sums.sum_c1 / totalCorrections, avg_c2: sums.sum_c2 / totalCorrections,
        avg_c3: sums.sum_c3 / totalCorrections, avg_c4: sums.sum_c4 / totalCorrections,
        avg_c5: sums.sum_c5 / totalCorrections,
    };

    const competencyAverages = [
        { name: 'Competência 1', average: averages.avg_c1 }, { name: 'Competência 2', average: averages.avg_c2 },
        { name: 'Competência 3', average: averages.avg_c3 }, { name: 'Competência 4', average: averages.avg_c4 },
        { name: 'Competência 5', average: averages.avg_c5 },
    ];

    const pointToImprove = competencyAverages.sort((a, b) => a.average - b.average)[0];

    const progression = validCorrections
        .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime())
        .map(c => ({
            date: c.submitted_at ? new Date(c.submitted_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
            grade: c.final_grade,
        }));

    return { data: { totalCorrections, averages, pointToImprove, progression } };
}
export async function calculateWritingStreak() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: 0 };

    const { data, error } = await supabase
        .from('essays')
        .select('submitted_at')
        .eq('student_id', user.id)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) return { data: 0 };

    const dates = [...new Set(data.map(e => new Date(e.submitted_at!).toDateString()))]
        .map(d => new Date(d));

    if (dates.length === 0) return { data: 0 };

    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = dates[0].toDateString() === today.toDateString();
    const isYesterday = dates[0].toDateString() === yesterday.toDateString();

    if(isToday || isYesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const current = dates[i-1];
            const previous = dates[i];
            const diffTime = Math.abs(current.getTime() - previous.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
            if (diffDays <= 1) {
                streak++;
            } else {
                break;
            }
        }
    }

    return { data: streak };
}

export async function getUserStateRank() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };

    const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('address_state')
        .eq('id', user.id)
        .single();

    if (profileError || !userProfile || !userProfile.address_state) {
        return { data: { rank: null, state: null } };
    }

    const userState = userProfile.address_state;

    const { data, error } = await supabase.rpc('get_user_rank_in_state', {
        p_user_id: user.id,
        p_state: userState
    });

    if (error) {
        console.error('Erro ao chamar RPC get_user_rank_in_state:', error);
        return { data: { rank: null, state: userState } };
    }

    return { data: { rank: data, state: userState } };
}

// --- FUNÇÕES DE NOTIFICAÇÃO E NOVAS FUNÇÕES ---

export async function createNotification(userId: string, title: string, message: string, link: string | null) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            link,
        });

    if (error) {
        console.error('Erro ao criar notificação:', error);
    }
    return { error };
}

export async function getFrequentErrors() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data, error } = await supabase.rpc('get_frequent_errors_for_student', { p_student_id: user.id });

    if (error) {
        console.error("Erro ao buscar erros frequentes:", error);
        return { error: error.message };
    }

    return { data };
}

export async function getCurrentEvents() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('current_events')
        .select('id, title, summary, link')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return { error: error.message };
    return { data };
}

export async function getCorrectedEssaysForTeacher() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, submitted_at, profiles(full_name), essay_corrections!inner(final_grade, corrector_id)')
    .eq('status', 'corrected')
    .eq('essay_corrections.corrector_id', user.id)
    .order('submitted_at', { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

// =============================================================================
// == NOVAS FUNÇÕES SERÃO ADICIONADAS ABAIXO DESTA LINHA =========================
// =============================================================================

export async function getAIFeedbackForEssay(essayId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('ai_feedback')
        .select('*')
        .eq('essay_id', essayId)
        .maybeSingle();
    
    if (error) {
        console.error("Erro ao buscar feedback da IA:", error);
        return { data: null, error: error.message };
    }

    return { data };
}

export async function checkForPlagiarism(_text: string): Promise<{ data?: { similarity_percentage: number; matches: { source: string; text: string }[] }; error?: string }> {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const hasPlagiarism = Math.random() > 0.5;
        if (hasPlagiarism) {
            return {
                data: {
                    similarity_percentage: Math.random() * (30 - 5) + 5,
                    matches: [
                        { source: "Artigo online 'Exemplo.com'", text: "um trecho simulado encontrado na internet que se parece com o texto do aluno." },
                        { source: "Redação de outro aluno (ID: XXX)", text: "outro trecho que se assemelha a uma redação já enviada na plataforma." }
                    ]
                }
            };
        } else {
            return {
                data: {
                    similarity_percentage: Math.random() * 4,
                    matches: []
                }
            };
        }
    } catch {
        return { error: "Não foi possível conectar ao serviço de verificação de plágio." };
    }
}
"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

// Tipos para facilitar
export type Essay = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'corrected';
  submitted_at: string | null;
  prompt_id: string | null;
  student_id: string;
  consent_to_ai_training?: boolean;
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
};

export type EssayPrompt = {
    id: string;
    title: string;
    description: string;
    source: string;
};

// --- Funções Principais (CRUD) ---

export async function saveOrUpdateEssay(essayData: Partial<Essay>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const dataToUpsert = {
    id: essayData.id,
    student_id: user.id,
    title: essayData.title,
    content: essayData.content,
    status: essayData.status,
    prompt_id: essayData.prompt_id,
    submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : essayData.submitted_at,
    consent_to_ai_training: essayData.consent_to_ai_training,
  };

  const { data, error } = await supabase.from('essays').upsert(dataToUpsert).select().single();

  if (error) return { error: `Erro ao salvar: ${error.message}` };
  
  revalidatePath('/dashboard/applications/write');
  revalidatePath('/dashboard');
  return { data };
}

export async function getPrompts(): Promise<{ data?: EssayPrompt[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('id, title, description, source');
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
    .select('id, title, status, submitted_at')
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


// --- Funções de Correção ---

export async function getCorrectionForEssay(essayId: string): Promise<{ data?: EssayCorrection & { profiles: { full_name: string | null } }; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_corrections')
        .select(`*, profiles (full_name)`)
        .eq('essay_id', essayId)
        .single();

    if (error && error.code !== 'PGRST116') return { error: error.message };
    return { data: data || undefined };
}

export async function submitCorrection(correctionData: Omit<EssayCorrection, 'id' | 'corrector_id' | 'created_at'>) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado.' };

    const { data: correction, error: correctionError } = await supabase
        .from('essay_corrections')
        .insert({ ...correctionData, corrector_id: user.id })
        .select().single();
    
    if (correctionError) return { error: `Erro ao salvar correção: ${correctionError.message}` };

    const { error: essayError } = await supabase
        .from('essays')
        .update({ status: 'corrected' })
        .eq('id', correctionData.essay_id);
    
    if (essayError) return { error: `Erro ao atualizar status da redação: ${essayError.message}` };
    
    revalidatePath('/dashboard/applications/write');
    return { data: correction };
}


// --- Funções de Estatísticas e Ranking ---

/**
 * CORRIGIDO: Esta função agora busca as correções de forma eficiente e correta,
 * consultando primeiro as redações do aluno e depois as correções associadas.
 */
export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado.' };
    
    // Passo 1: Buscar todas as redações corrigidas do aluno com suas correções.
    const { data: correctedEssays, error } = await supabase
        .from('essays')
        .select(`
            submitted_at,
            essay_corrections (
                final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5
            )
        `)
        .eq('student_id', user.id)
        .eq('status', 'corrected')
        .not('essay_corrections', 'is', null); // Garante que só venham redações com correção

    if (error || !correctedEssays || correctedEssays.length === 0) {
        return { data: null, error: error?.message };
    }

    // Filtra para garantir que cada redação tenha de fato uma correção (array não vazio)
    const validCorrections = correctedEssays
        .map(essay => ({ ...essay.essay_corrections[0], submitted_at: essay.submitted_at }))
        .filter(correction => correction && correction.final_grade !== undefined);

    if (validCorrections.length === 0) {
        return { data: null };
    }

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
        .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime()) // Ordena por data
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
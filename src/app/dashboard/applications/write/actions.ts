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

// Ação para o aluno salvar ou submeter uma redação
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
  };

  const { data, error } = await supabase.from('essays').upsert(dataToUpsert).select().single();

  if (error) return { error: `Erro ao salvar: ${error.message}` };
  
  revalidatePath('/dashboard/applications/write');
  return { data };
}

// Ação para buscar os temas de redação
export async function getPrompts(): Promise<{ data?: EssayPrompt[]; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('essay_prompts')
        .select('id, title, description, source');
    if (error) return { error: error.message };
    return { data: data || [] };
}

// Ação para o professor buscar uma redação específica com o nome do aluno
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

// Ação para o professor salvar uma correção
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

// Ação para buscar a correção de uma redação
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

// ===================================================================
// FUNÇÕES ATUALIZADAS E NOVAS
// ===================================================================
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

// NOVA AÇÃO para buscar todas as correções de um aluno
export async function getCorrectionsForStudent(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('essay_corrections')
    .select('final_grade, grade_c1, grade_c2, grade_c3, grade_c4, grade_c5, essays ( submitted_at )')
    .eq('essays.student_id', studentId)
    .order('submitted_at', { foreignTable: 'essays', ascending: true });

  if (error) return { error: error.message };
  return { data };
}

// NOVA AÇÃO para calcular as estatísticas do aluno
export async function getStudentStatistics() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado.' };
    
    const { data: corrections, error } = await getCorrectionsForStudent(user.id);

    if (error || !corrections || corrections.length === 0) {
        return { data: null }; // Retorna nulo se não houver dados para calcular
    }

    const totalCorrections = corrections.length;
    const initialStats = {
        sum_final_grade: 0,
        sum_c1: 0, sum_c2: 0, sum_c3: 0, sum_c4: 0, sum_c5: 0,
    };

    const sums = corrections.reduce((acc, current) => {
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
        avg_c1: sums.sum_c1 / totalCorrections,
        avg_c2: sums.sum_c2 / totalCorrections,
        avg_c3: sums.sum_c3 / totalCorrections,
        avg_c4: sums.sum_c4 / totalCorrections,
        avg_c5: sums.sum_c5 / totalCorrections,
    };
    
    const competencyAverages = [
        { name: 'C1', average: averages.avg_c1 },
        { name: 'C2', average: averages.avg_c2 },
        { name: 'C3', average: averages.avg_c3 },
        { name: 'C4', average: averages.avg_c4 },
        { name: 'C5', average: averages.avg_c5 },
    ];

    const pointToImprove = competencyAverages.sort((a, b) => a.average - b.average)[0];
    
    const progression = corrections.map(c => ({
        date: new Date(c.essays!.submitted_at!).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        grade: c.final_grade,
    }));

    return {
        data: {
            totalCorrections,
            averages,
            pointToImprove,
            progression,
        }
    };
}
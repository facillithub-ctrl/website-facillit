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
// NOVA FUNÇÃO QUE ESTAVA FALTANDO
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
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
  // Adicione mais campos conforme necessário
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

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  // Se já existe um ID, atualiza. Senão, cria uma nova.
  if (essayData.id) {
    const { data, error } = await supabase
      .from('essays')
      .update({
        title: essayData.title,
        content: essayData.content,
        status: essayData.status,
        submitted_at: essayData.status === 'submitted' ? new Date().toISOString() : null,
      })
      .eq('id', essayData.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath('/dashboard/applications/write');
    return { data };
  } else {
    const { data, error } = await supabase
      .from('essays')
      .insert({
        student_id: user.id,
        title: essayData.title,
        content: essayData.content,
        status: 'draft',
        prompt_id: essayData.prompt_id,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath('/dashboard/applications/write');
    return { data };
  }
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
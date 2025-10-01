"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

// NOVO: Tipo EssayPrompt atualizado para incluir os novos campos
export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    image_url: string | null;
    motivational_text: string | null;
    category: string | null;
    publication_date: string | null; // NOVO
    deadline: string | null;         // NOVO
    cover_image_source: string | null; // NOVO
};


// --- Helper de Segurança ---
async function isAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category')
    .eq('id', user.id)
    .single();

  return profile?.user_category === 'administrator';
}

// --- Funções do Módulo WRITE ---

export async function getWriteModuleData() {
  if (!(await isAdmin())) {
    return { error: 'Acesso não autorizado.' };
  }

  const supabase = await createSupabaseServerClient();
  
  const [studentsResult, professorsResult, promptsResult, eventsResult, examsResult] = await Promise.all([
    supabase.from('profiles').select('id, full_name, user_category, created_at').or('user_category.eq.aluno,user_category.eq.vestibulando'),
    supabase.from('profiles').select('id, full_name, user_category, is_verified, created_at').eq('user_category', 'professor'),
    supabase.from('essay_prompts').select('*').order('created_at', { ascending: false }),
    supabase.from('current_events').select('*').order('created_at', { ascending: false }),
    supabase.from('exam_dates').select('*').order('exam_date', { ascending: true })
  ]);

  const error = studentsResult.error || professorsResult.error || promptsResult.error || eventsResult.error || examsResult.error;

  if (error) {
    return { error: error.message };
  }

  return {
    data: {
      students: studentsResult.data,
      professors: professorsResult.data,
      prompts: promptsResult.data,
      currentEvents: eventsResult.data,
      examDates: examsResult.data,
    }
  };
}

export async function updateProfessorVerification(professorId: string, isVerified: boolean) {
  if (!(await isAdmin())) {
    return { error: 'Acesso não autorizado.' };
  }
  
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: isVerified })
    .eq('id', professorId)
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath('/admin/write');
  return { data };
}

export async function upsertPrompt(promptData: Partial<EssayPrompt>) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();

    // Limpa campos vazios para não salvar strings vazias no banco
    const cleanedData = { ...promptData };
    for (const key in cleanedData) {
        if (cleanedData[key as keyof typeof cleanedData] === '') {
            cleanedData[key as keyof typeof cleanedData] = null;
        }
    }
    
    const { data, error } = await supabase
        .from('essay_prompts')
        .upsert(cleanedData)
        .select()
        .single();

    if (error) return { error: `Erro no upsert: ${error.message}` };

    revalidatePath('/admin/write');
    revalidatePath('/dashboard/applications/write');
    return { data };
}

export async function deletePrompt(promptId: string) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('essay_prompts').delete().eq('id', promptId);
    
    if (error) return { error: error.message };

    revalidatePath('/admin/write');
    revalidatePath('/dashboard/applications/write');
    return { success: true };
}

// ... O resto das funções (upsertCurrentEvent, upsertExamDate) continua igual
export async function upsertCurrentEvent(eventData: { id?: string; title: string; summary: string; link: string; }) {
    if (!(await isAdmin())) return { error: 'Acesso não autenticado.' };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('current_events').upsert(eventData).select().single();
    if (error) return { error: error.message };
    revalidatePath('/admin/write');
    return { data };
}

export async function upsertExamDate(examData: { id?: string; name: string; exam_date: string; }) {
    if (!(await isAdmin())) return { error: 'Acesso não autenticado.' };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('exam_dates').upsert(examData).select().single();
    if (error) return { error: error.message };
    revalidatePath('/admin/write');
    return { data };
}
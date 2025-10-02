"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

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
    difficulty: number | null; // NOVO
    tags: string[] | null; // NOVO
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
    supabase.from('profiles').select('id, full_name, user_category, created_at, verification_badge').or('user_category.eq.aluno,user_category.eq.vestibulando'),
    supabase.from('profiles').select('id, full_name, user_category, is_verified, created_at, verification_badge').eq('user_category', 'professor'),
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

export async function updateUserVerification(userId: string, badge: string | null) {
  if (!(await isAdmin())) {
    return { error: 'Acesso não autorizado.' };
  }
  
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ verification_badge: badge, verification_status: badge ? 'approved' : null })
    .eq('id', userId)
    .select();

  if (error) return { error: error.message };
  
  revalidatePath('/admin/write');
  return { data };
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

    const cleanedData: { [key: string]: any } = {};
    for (const key in promptData) {
        const value = promptData[key as keyof typeof promptData];
        if (key === 'tags' && typeof value === 'string') {
            cleanedData[key] = value.split(',').map(tag => tag.trim()).filter(Boolean);
        } else {
            cleanedData[key] = value === '' ? null : value;
        }
    }
    
    let result;
    if (cleanedData.id) {
        const { id, ...updateData } = cleanedData;
        result = await supabase
            .from('essay_prompts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
    } else {
        result = await supabase
            .from('essay_prompts')
            .insert(cleanedData)
            .select()
            .single();
    }

    const { data, error } = result;

    if (error) {
        console.error("Erro no Supabase ao salvar o tema:", error);
        return { error: `Erro ao salvar no banco de dados: ${error.message}` };
    }

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
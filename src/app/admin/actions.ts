"use server";

import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/utils/supabase/server';

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
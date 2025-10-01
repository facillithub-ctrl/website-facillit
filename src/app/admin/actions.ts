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
  
  const [studentsResult, professorsResult] = await Promise.all([
    supabase.from('profiles').select('id, full_name, user_category, created_at').or('user_category.eq.aluno,user_category.eq.vestibulando'),
    supabase.from('profiles').select('id, full_name, user_category, is_verified, created_at').eq('user_category', 'professor')
  ]);

  if (studentsResult.error || professorsResult.error) {
    return { error: studentsResult.error?.message || professorsResult.error?.message };
  }

  return {
    data: {
      students: studentsResult.data,
      professors: professorsResult.data,
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
"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { EssayPrompt, UserProfile } from "../dashboard/types";

// Helper de Segurança para verificar se o usuário é admin
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

//================================================================//
// FUNÇÕES PARA GESTÃO DO WRITE (/admin/write)
//================================================================//

export async function updateUserVerification(userId: string, badge: string | null) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
        .from('profiles')
        .update({ verification_badge: badge })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/write');
    return { success: true };
}

export async function getWriteModuleData() {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, user_category, created_at, verification_badge')
        .in('user_category', ['student', 'vestibulando']);

    const { data: professors, error: professorsError } = await supabase
        .from('profiles')
        .select('id, full_name, verification_badge')
        .eq('user_category', 'professor');

    const { data: prompts, error: promptsError } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (studentsError || professorsError || promptsError) {
        const error = studentsError || professorsError || promptsError;
        return { error: error?.message };
    }

    return { data: { students, professors, prompts } };
}

export async function upsertPrompt(promptData: Partial<EssayPrompt>) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').upsert(promptData).select().single();
    
    if (error) return { error: error.message };
    
    revalidatePath('/admin/write');
    return { data };
}

export async function deletePrompt(promptId: string) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('essay_prompts').delete().eq('id', promptId);

    if (error) return { error: error.message };

    revalidatePath('/admin/write');
    return { success: true };
}

// =================================================================
// == FUNÇÕES PARA GESTÃO DE INSTITUIÇÕES (PAINEL DO ADMIN) ==
// =================================================================

export async function getAllOrganizations() {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, cnpj, created_at, profiles(full_name)')
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }
    
    return { data };
}

export async function createOrganization(name: string, cnpj: string | null) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('organizations')
        .insert({ name, cnpj, owner_id: user!.id })
        .select()
        .single();
    
    if (error) {
        return { error: `Erro do banco de dados: ${error.message}` };
    }

    revalidatePath('/admin/schools');
    return { data };
}

export async function generateInviteCode(formData: { organizationId: string; role: 'diretor' | 'professor' | 'aluno'; fullName?: string; email?: string }) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('invitation_codes')
        .insert({
            organization_id: formData.organizationId,
            role: formData.role,
            full_name: formData.fullName,
            email: formData.email,
            created_by: user!.id,
        })
        .select('code')
        .single();

    if (error) {
        return { error: `Erro do banco de dados: ${error.message}` };
    }
    
    revalidatePath('/admin/schools');
    return { data };
}
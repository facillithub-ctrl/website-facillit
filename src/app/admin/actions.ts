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
// FUNÇÕES PARA GESTÃO DE ESCOLAS (PAINEL DO DIRETOR)
//================================================================//
// (As funções existentes como getOrganizationData, createClass, etc. permanecem aqui)
// ...

//================================================================//
// FUNÇÕES PARA GESTÃO DO WRITE (/admin/write)
//================================================================//
// (As funções existentes como updateUserVerification, getWriteModuleData, etc. permanecem aqui)
// ...


// =================================================================
// == NOVAS FUNÇÕES PARA GESTÃO DE INSTITUIÇÕES (PAINEL DO ADMIN) ==
// =================================================================

/**
 * Busca todas as organizações cadastradas na plataforma.
 * Apenas para administradores.
 */
export async function getAllOrganizations() {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, cnpj, created_at, profiles(full_name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar organizações:", error.message);
        return { error: error.message };
    }
    
    return { data };
}

/**
 * Cria uma nova organização (instituição de ensino).
 * Apenas para administradores.
 */
export async function createOrganization(name: string, cnpj: string | null) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('organizations')
        .insert({
            name,
            cnpj,
            owner_id: user!.id // O admin que cria é o "dono" inicial
        })
        .select()
        .single();
    
    if (error) {
        console.error("Erro ao criar organização:", error.message);
        return { error: `Erro do banco de dados: ${error.message}` };
    }

    revalidatePath('/admin/schools');
    return { data };
}

/**
 * Gera um novo código de convite para uma organização.
 * Apenas para administradores.
 */
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
        console.error("Erro ao gerar código:", error.message);
        return { error: `Erro do banco de dados: ${error.message}` };
    }
    
    revalidatePath('/admin/schools');
    return { data };
}
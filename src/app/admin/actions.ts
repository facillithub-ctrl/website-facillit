"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { UserProfile } from "../dashboard/types";

// Verifica se o utilizador atual tem a categoria 'admin'.
export async function isAdmin() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_category')
        .eq('id', user.id)
        .single();

    return profile?.user_category === 'admin';
}

// Busca todos os dados relevantes de uma organização para a página de gestão.
export async function getOrganizationData(orgId: string) {
    const supabase = await createSupabaseServerClient();
    
    // Busca os detalhes da organização.
    const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
    
    if (orgError) {
        console.error("Erro ao buscar organização:", orgError.message);
        return null;
    }

    // Busca todos os membros (perfis) da organização.
    const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId);

    // Busca todas as turmas da organização e os seus membros.
    const { data: classes, error: classesError } = await supabase
        .from('school_classes')
        .select(`
            id,
            name,
            organization_id,
            members:class_members (
                profile:profiles (
                    *,
                    role:class_members (role)
                )
            )
        `)
        .eq('organization_id', orgId);

    // Formata os dados para um formato mais fácil de usar na interface.
    const formattedClasses = classes?.map(c => ({
        ...c,
        members: c.members.map((m: any) => ({
            ...m.profile,
            // A query retorna uma lista de roles, pegamos a primeira (e única).
            role: m.profile.role[0]?.role 
        }))
    })) || [];
    
    return {
        organization,
        members: members || [],
        classes: formattedClasses,
    };
}

// Busca os utilizadores de uma organização que não estão em nenhuma turma.
export async function getUnassignedUsers(orgId: string): Promise<UserProfile[]> {
    const supabase = await createSupabaseServerClient();
    // Chama a função RPC que criámos no SQL.
    const { data, error } = await supabase.rpc('get_unassigned_users', { org_id: orgId });
    if (error) {
        console.error("Erro ao buscar utilizadores não designados:", error);
        return [];
    }
    return data as UserProfile[];
}

// Cria uma nova turma na base de dados.
export async function createClass(organizationId: string, name: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('school_classes')
        .insert({ organization_id: organizationId, name: name })
        .select()
        .single();
        
    if (error) {
        console.error("Erro ao criar turma:", error.message);
        return { error: error.message };
    }

    // Informa o Next.js para recarregar os dados na página de gestão.
    revalidatePath('/admin/schools');
    return { data };
}

// Adiciona um utilizador a uma turma.
export async function addUserToClass(classId: string, userId: string, role: 'student' | 'teacher') {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('class_members')
        .insert({ class_id: classId, user_id: userId, role: role });
        
    if (error) {
        console.error("Erro ao adicionar utilizador à turma:", error.message);
        return { error: error.message };
    }
    
    revalidatePath('/admin/schools');
    return { data };
}

// Remove um utilizador de uma turma.
export async function removeUserFromClass(classId: string, userId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', classId)
        .eq('user_id', userId);
        
    if (error) {
        console.error("Erro ao remover utilizador da turma:", error.message);
        return { error: error.message };
    }
    
    revalidatePath('/admin/schools');
    return { data: { success: true } };
}
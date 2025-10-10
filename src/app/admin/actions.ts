"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { UserProfile } from "../dashboard/types";

// Verifica se o utilizador atual tem a categoria 'admin' ou 'diretor'.
export async function isManager() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_category')
        .eq('id', user.id)
        .single();

    return profile?.user_category === 'admin' || profile?.user_category === 'diretor';
}

// Busca todos os dados relevantes de uma organização para a página de gestão.
export async function getOrganizationData(orgId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
    
    if (orgError) {
        console.error("Erro ao buscar organização:", orgError.message);
        return null;
    }

    const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId);

    // ✅ CORREÇÃO APLICADA NA CONSULTA E NA FORMATAÇÃO ABAIXO
    const { data: classes, error: classesError } = await supabase
        .from('school_classes')
        .select(`
            id,
            name,
            organization_id,
            members:class_members (
                role,
                profile:profiles!inner (
                    id,
                    full_name, 
                    userCategory:user_category
                )
            )
        `)
        .eq('organization_id', orgId);

    if (classesError) {
        console.error("Erro ao buscar turmas:", classesError.message);
        return null; // Adicionado para evitar processamento com erro
    }
    
    // Formata os dados para um formato mais fácil de usar na interface.
    const formattedClasses = classes?.map(c => ({
        id: c.id,
        name: c.name,
        organization_id: c.organization_id,
        members: c.members.map((m: any) => ({
            // Mapeamento explícito de full_name para fullName
            ...m.profile,
            fullName: m.profile.full_name,
            role: m.role
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
        .select('id, name, organization_id')
        .single();
        
    if (error) {
        console.error("Erro ao criar turma:", error.message);
        return { error: "Não foi possível criar a turma. Verifique se o nome já existe." };
    }

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
        return { error: "Não foi possível adicionar o utilizador. Ele já pode pertencer a esta turma." };
    }
    
    revalidatePath('/admin/schools');
    return { data: { success: true } };
}

// Remove um utilizador de uma turma.
export async function removeUserFromClass(classId: string, userId: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', classId)
        .eq('user_id', userId);
        
    if (error) {
        console.error("Erro ao remover utilizador da turma:", error.message);
        return { error: "Não foi possível remover o utilizador." };
    }
    
    revalidatePath('/admin/schools');
    return { data: { success: true } };
}
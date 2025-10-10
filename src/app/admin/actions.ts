"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { EssayPrompt, UserProfile } from "../dashboard/types";

//================================================================//
// FUNÇÕES PARA GESTÃO DE ESCOLAS (/admin/schools)
//================================================================//

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

    const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId);

    const { data: classes, error: classesError } = await supabase
        .from('school_classes')
        .select(`
            id, name, organization_id,
            members:class_members (
                role,
                profile:profiles!inner ( id, full_name, userCategory:user_category )
            )
        `)
        .eq('organization_id', orgId);

    if (classesError) {
        console.error("Erro ao buscar turmas:", classesError.message);
        return null;
    }
    
    const formattedClasses = classes?.map(c => ({
        id: c.id,
        name: c.name,
        organization_id: c.organization_id,
        members: c.members.map((m: any) => ({
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

export async function getUnassignedUsers(orgId: string): Promise<UserProfile[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_unassigned_users', { org_id: orgId });
    if (error) {
        console.error("Erro ao buscar utilizadores não designados:", error);
        return [];
    }
    return data as UserProfile[];
}

export async function createClass(organizationId: string, name: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('school_classes')
        .insert({ organization_id: organizationId, name: name })
        .select('id, name, organization_id')
        .single();
        
    if (error) {
        console.error("Erro ao criar turma:", error.message);
        if (error.code === '23505') {
            return { error: `Já existe uma turma chamada "${name}" nesta instituição.` };
        }
        return { error: `Erro do banco de dados: ${error.message}` };
    }

    revalidatePath('/admin/schools');
    return { data };
}

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

//================================================================//
// FUNÇÕES PARA GESTÃO DO WRITE (/admin/write)
//================================================================//

// ✅ FUNÇÃO ADICIONADA
export async function updateUserVerification(userId: string, badge: string | null) {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
        .from('profiles')
        .update({ verification_badge: badge })
        .eq('id', userId);

    if (error) {
        console.error("Erro ao atualizar selo de verificação:", error.message);
        return { error: error.message };
    }

    revalidatePath('/admin/write');
    return { success: true };
}

// ✅ FUNÇÃO ADICIONADA
export async function getWriteModuleData() {
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
        console.error("Erro ao buscar dados do módulo Write:", error?.message);
        return { error: error?.message };
    }

    return { data: { students, professors, prompts } };
}

// ✅ FUNÇÃO ADICIONADA
export async function upsertPrompt(promptData: Partial<EssayPrompt>) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').upsert(promptData).select().single();
    
    if (error) return { error: error.message };
    
    revalidatePath('/admin/write');
    return { data };
}

// ✅ FUNÇÃO ADICIONADA
export async function deletePrompt(promptId: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('essay_prompts').delete().eq('id', promptId);

    if (error) return { error: error.message };

    revalidatePath('/admin/write');
    return { success: true };
}
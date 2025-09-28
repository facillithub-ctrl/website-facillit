"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServerClient from "@/utils/supabase/server";
import { EssayPrompt } from "../applications/write/actions";

// Busca todos os temas
export async function getAllPrompts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').select('*').order('created_at', { ascending: false });
    return { data, error };
}

// Cria ou atualiza um tema
export async function upsertPrompt(promptData: Partial<EssayPrompt>) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('essay_prompts').upsert(promptData).select().single();

    if (!error) {
        revalidatePath('/dashboard/admin'); // Revalida a página do admin para mostrar a lista atualizada
    }

    return { data, error };
}

// Deleta um tema
export async function deletePrompt(promptId: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('essay_prompts').delete().eq('id', promptId);

    if (!error) {
        revalidatePath('/dashboard/admin');
    }

    return { error };
}
"use server";

import createSupabaseServerClient from '@/utils/supabase/server';

export async function getUpdates() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Erro ao buscar atualizações:", error);
        return { error: error.message };
    }
    return { data };
}
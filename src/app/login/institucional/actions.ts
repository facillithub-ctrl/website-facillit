// Caminho: src/app/login/institucional/actions.ts

"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function validateInstitutionalCode(code: string): Promise<{ error?: string, redirectPath?: string }> {
    if (!code || !code.startsWith('FHB-')) {
        return { error: 'Formato de código inválido.' };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from('invitation_codes')
        .select('id, is_active, used_by, expires_at')
        .eq('code', code)
        .single();

    if (error || !data) {
        return { error: 'Código não encontrado.' };
    }

    if (data.used_by) {
        return { error: 'Este código já foi utilizado.' };
    }
    
    if (!data.is_active) {
        return { error: 'Este código não está mais ativo.' };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { error: 'Este código expirou.' };
    }

    // Se tudo estiver certo, redireciona para a página de cadastro institucional
    redirect(`/register/institucional?code=${code}`);
}
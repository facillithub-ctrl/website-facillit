"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
// A importação do 'redirect' não é mais necessária aqui.
// import { redirect } from "next/navigation"; 

// A função agora retorna uma Promise que pode conter 'error' ou 'redirectPath'.
export async function validateInstitutionalCode(code: string): Promise<{ error?: string; redirectPath?: string }> {
    if (!code || !code.startsWith('FHB-')) {
        return { error: 'Formato de código inválido.' };
    }

    const supabase = await createSupabaseServerClient();

    // A chamada à função RPC continua a ser a forma correta e segura de validar.
    const { data, error: rpcError } = await supabase.rpc('validate_invitation_code', {
      p_code: code
    });

    if (rpcError) {
        console.error('Erro ao chamar a função RPC validate_invitation_code:', rpcError);
        return { error: 'Ocorreu um erro no servidor ao validar o código.' };
    }
    
    const result = data as { valid: boolean; error: string | null };

    // Se o resultado da função indicar que o código não é válido, retornamos o erro.
    if (!result.valid) {
        return { error: result.error || 'Código inválido.' };
    }

    // ✅ CORREÇÃO PRINCIPAL:
    // Em vez de chamar redirect(), retornamos o caminho para a página de registo.
    // A página que chamou esta função irá agora usar este caminho para navegar.
    return { redirectPath: `/register/institucional?code=${code}` };
}   
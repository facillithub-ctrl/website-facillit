"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

type FormData = {
    fullName?: string;
    birthDate?: string;
    cpf?: string;
    email?: string;
    password?: string;
    nickname?: string;
    pronoun?: string;
    organizationId?: string;
    organizationName?: string;
    invitationCode?: string;
};

function InstitutionalRegister() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [formData, setFormData] = useState<FormData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => { setInit(true); });
    }, []);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            router.push('/login/institucional');
            return;
        }

        const verifyCodeAndGetOrg = async () => {
            // ✅ CORREÇÃO: Chamamos a nova e segura função RPC para obter os detalhes da organização.
            const { data, error } = await supabase
                .rpc('get_organization_for_invitation_code', { p_code: code })
                .single(); // Usamos .single() porque esperamos apenas um resultado.

            if (error || !data || !data.organization_id) {
                setError('Código de convite inválido ou a organização associada não foi encontrada.');
                setTimeout(() => router.push('/login/institucional'), 3000);
            } else {
                setFormData(prev => ({
                    ...prev,
                    invitationCode: code,
                    organizationId: data.organization_id,
                    organizationName: data.organization_name
                }));
            }
        };
        
        verifyCodeAndGetOrg();
    }, [searchParams, router, supabase]);

    const particlesLoaded = async (container?: Container): Promise<void> => {};
    const options: ISourceOptions = useMemo(() => ({ /* As suas opções de partículas aqui */ }), []);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!agreedToTerms) { setError("Você precisa concordar com os Termos de Uso."); return; }
        setIsLoading(true);
        setError(null);

        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email: formData.email!,
            password: formData.password!,
            options: { data: { full_name: formData.fullName } }
        });

        if (signUpError) { setError(signUpError.message); setIsLoading(false); return; }

        if (user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: formData.fullName,
                nickname: formData.nickname,
                birth_date: formData.birthDate,
                pronoun: formData.pronoun,
                user_category: 'aluno',
                cpf: formData.cpf,
                school_name: formData.organizationName,
                organization_id: formData.organizationId,
                has_agreed_to_terms: true,
                has_completed_onboarding: false,
                updated_at: new Date().toISOString(),
            });

            if (profileError) {
                setError(`Erro ao salvar perfil: ${profileError.message}`);
            } else {
                await supabase.from('invitation_codes').update({ used_by: user.id }).eq('code', formData.invitationCode!);
                router.push('/login?status=success');
            }
        }
        setIsLoading(false);
    };

    if (!init || !formData.organizationName) {
        return <div className="min-h-screen bg-royal-blue flex items-center justify-center text-white">Verificando código...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
            <Particles id="tsparticles" options={options} className="absolute inset-0 z-0" />
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg z-10">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold">Cadastro Institucional</h2>
                    <p className="text-text-muted">Você está se juntando à instituição:</p>
                    <p className="font-bold text-lg text-royal-blue">{formData.organizationName}</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4 text-sm">
                    <input type="text" name="fullName" required placeholder="Nome Completo" onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} className="w-full p-2 border rounded-md" />
                    <input type="email" name="email" required placeholder="Seu melhor e-mail" onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full p-2 border rounded-md" />
                    <input type="password" name="password" required placeholder="Crie uma senha" onChange={e => setFormData(p => ({...p, password: e.target.value}))} className="w-full p-2 border rounded-md" />
                    <input type="text" name="schoolName" value={formData.organizationName} disabled className="w-full p-2 border rounded-md bg-gray-100" />
                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-5 w-5 mt-1 rounded border-gray-300" />
                            <span className="text-xs text-gray-600">Eu li e concordo com os <Link href="/recursos/uso" target="_blank" className="font-bold underline">Termos de Uso</Link>.</span>
                        </label>
                    </div>
                    <button type="submit" disabled={isLoading || !agreedToTerms} className="w-full py-3 bg-royal-blue text-white font-bold rounded-lg disabled:bg-gray-400">
                        {isLoading ? 'Finalizando...' : 'Finalizar Cadastro'}
                    </button>
                    {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default function InstitutionalRegisterPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <InstitutionalRegister />
        </Suspense>
    );
}
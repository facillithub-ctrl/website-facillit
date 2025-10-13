"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

// --- Tipos de Dados ---
type FormData = {
    userCategory?: string;
    fullName?: string;
    birthDate?: string;
    cpf?: string;
    serie?: string;
    email?: string;
    password?: string;
    nickname?: string;
    pronoun?: string;
    organizationId?: string;
    organizationName?: string;
    invitationCode?: string;
    addressCep?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    categoryDetails?: {
        serie?: string;
        subjects?: string[];
        experience?: string;
        institutionType?: string;
        position?: string;
        phone?: string;
        vestibularYear?: string;
        desiredCourse?: string;
    };
};

// --- Componentes de Etapa (Steps) ---
const PersonalDataStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onNext({ fullName: e.currentTarget.fullName.value, birthDate: e.currentTarget.birthDate.value, cpf: e.currentTarget.cpf.value, serie: e.currentTarget.serie.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <h2 className="text-xl font-bold text-center mb-4">Seus Dados Pessoais</h2>
            <div><label htmlFor="fullName" className="font-medium">Nome Completo</label><input type="text" name="fullName" defaultValue={initialData.fullName || ''} required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="birthDate" className="font-medium">Data de Nascimento</label><input type="date" name="birthDate" defaultValue={initialData.birthDate || ''} required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="cpf" className="font-medium">CPF (Opcional)</label><input type="text" name="cpf" defaultValue={initialData.cpf || ''} placeholder="000.000.000-00" className="w-full p-2 border rounded-md mt-1" /></div>
            <div>
                <label htmlFor="serie" className="font-medium">Série</label>
                <select name="serie" defaultValue={initialData.serie || ''} required className="w-full p-2 border rounded-md mt-1 bg-white">
                    <option value="">Selecione sua série</option>
                    <option value="1_ano_em">1º Ano - Ensino Médio</option>
                    <option value="2_ano_em">2º Ano - Ensino Médio</option>
                    <option value="3_ano_em">3º Ano - Ensino Médio</option>
                    <option value="9_ano_ef">9º Ano - Ensino Fundamental</option>
                    <option value="8_ano_ef">8º Ano - Ensino Fundamental</option>
                    <option value="7_ano_ef">7º Ano - Ensino Fundamental</option>
                    <option value="6_ano_ef">6º Ano - Ensino Fundamental</option>
                    <option value="5_ano_ef">5º Ano - Ensino Fundamental</option>
                </select>
            </div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const AddressDataStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const [address, setAddress] = useState({ street: initialData.addressStreet || '', neighborhood: initialData.addressNeighborhood || '', city: initialData.addressCity || '', state: initialData.addressState || '' });
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setAddress({ street: data.logouro || '', neighborhood: data.bairro || '', city: data.localidade || '', state: data.uf || '' });
            }
        } catch (error) { console.error("Erro ao buscar CEP:", error); }
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        onNext({ addressCep: form.cep.value, addressStreet: form.street.value, addressNumber: form.number.value, addressComplement: form.complement.value, addressNeighborhood: form.neighborhood.value, addressCity: form.city.value, addressState: form.state.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <h3 className="text-xl font-bold text-center mb-4">Seu Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label htmlFor="cep" className="font-medium">CEP</label><input type="text" name="cep" onBlur={handleCepBlur} defaultValue={initialData.addressCep || ''} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="street" className="font-medium">Rua</label><input type="text" name="street" value={address.street} onChange={e => setAddress(a => ({...a, street: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="number" className="font-medium">Número</label><input type="text" name="number" defaultValue={initialData.addressNumber || ''} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="complement" className="font-medium">Complemento</label><input type="text" name="complement" defaultValue={initialData.addressComplement || ''} className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="neighborhood" className="font-medium">Bairro</label><input type="text" name="neighborhood" value={address.neighborhood} onChange={e => setAddress(a => ({...a, neighborhood: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="city" className="font-medium">Cidade</label><input type="text" name="city" value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="state" className="font-medium">Estado</label><input type="text" name="state" value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
            </div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const AuthStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({ length: false, uppercase: false, number: false });
    useEffect(() => { setPasswordCriteria({ length: password.length >= 8, uppercase: /[A-Z]/.test(password), number: /[0-9]/.test(password), }); }, [password]);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.password.value !== form.confirmPassword.value) { alert("As senhas não coincidem!"); return; }
        if (!Object.values(passwordCriteria).every(Boolean)) { alert("A senha não cumpre todos os requisitos."); return; }
        onNext({ email: form.email.value, password: form.password.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">Crie seus dados de acesso</h2>
            <div><label htmlFor="email" className="block text-sm font-medium mb-1">Seu melhor e-mail</label><input type="email" name="email" defaultValue={initialData.email || ''} required className="w-full p-3 border rounded-lg" /></div>
            <div className="relative"><label htmlFor="password" className="block text-sm font-medium mb-1">Crie uma senha</label><input type={showPassword ? 'text' : 'password'} name="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-text-muted"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></div>
            <div className="text-xs space-y-1 text-gray-500">
                <p className={passwordCriteria.length ? 'text-green-600' : ''}>{passwordCriteria.length ? '✓' : '•'} Mínimo de 8 caracteres</p>
                <p className={passwordCriteria.uppercase ? 'text-green-600' : ''}>{passwordCriteria.uppercase ? '✓' : '•'} Pelo menos uma letra maiúscula</p>
                <p className={passwordCriteria.number ? 'text-green-600' : ''}>{passwordCriteria.number ? '✓' : '•'} Pelo menos um número</p>
            </div>
            <div><label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirme sua senha</label><input type="password" name="confirmPassword" required className="w-full p-3 border rounded-lg" /></div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-3 px-6 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const PersonalizationStep = ({ onSubmit, onBack, isLoading, agreedToTerms, setAgreedToTerms, initialData }: { onSubmit: (data: Partial<FormData>) => void, onBack: () => void, isLoading: boolean, agreedToTerms: boolean, setAgreedToTerms: (value: boolean) => void, initialData: FormData }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit({ nickname: e.currentTarget.nickname.value, pronoun: e.currentTarget.pronoun.value }); };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">Quase lá! Personalize seu perfil</h2>
            <div><label htmlFor="nickname" className="block text-sm font-medium mb-1">Como gostaria de ser chamado(a)? (Apelido)</label><input type="text" name="nickname" defaultValue={initialData.nickname || ''} className="w-full p-3 border rounded-lg" /></div>
            <div><label htmlFor="pronoun" className="block text-sm font-medium mb-1">Pronome</label><select name="pronoun" defaultValue={initialData.pronoun || ''} className="w-full p-3 border rounded-lg bg-white"><option>Ele/Dele</option><option>Ela/Dela</option><option>Elu/Delu</option><option>Prefiro não informar</option></select></div>
            <div className="pt-2"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-5 w-5 mt-1 rounded border-gray-300 text-royal-blue focus:ring-royal-blue flex-shrink-0" /><span className="text-sm text-gray-600">Eu li e concordo com os <Link href="/recursos/uso" target="_blank" className="font-bold text-royal-blue underline">Termos de Uso</Link> e a <Link href="/recursos/privacidade" target="_blank" className="font-bold text-royal-blue underline">Política de Privacidade</Link>.</span></label></div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" disabled={isLoading || !agreedToTerms} className="py-3 px-6 bg-royal-blue text-white rounded-lg font-bold disabled:bg-gray-400">{isLoading ? 'Finalizando...' : 'Finalizar Cadastro'}</button></div>
        </form>
    );
};

const SuccessStep = () => {
    const router = useRouter();
    const goToLogin = () => router.push('/login');
    return (
        <div className="text-center flex flex-col h-full justify-center">
            <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4"><i className="fas fa-check text-3xl"></i></div>
            <h2 className="text-2xl font-bold mb-2">Conta criada com sucesso!</h2>
            <p className="text-text-muted mb-6">Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada para ativar sua conta.</p>
            <button onClick={goToLogin} className="w-full py-3 bg-royal-blue text-white rounded-lg font-bold">Ir para o Login</button>
        </div>
    );
};

// --- Componente Principal Unificado ---
function InstitutionalRegister() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [step, setStep] = useState('verifying');
    const [formData, setFormData] = useState<FormData>({ userCategory: 'aluno' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [init, setInit] = useState(false);

    useEffect(() => { initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => { setInit(true); }); }, []);
    
    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) { router.push('/login/institucional'); return; }
        const verifyCodeAndGetOrg = async () => {
            const { data, error } = await supabase.rpc('get_organization_for_invitation_code', { p_code: code }).single<{ organization_id: string; organization_name: string }>();
            if (error || !data || !data.organization_id) { setError('Código de convite inválido ou a organização associada não foi encontrada.'); setTimeout(() => router.push('/login/institucional'), 3000); } else { setFormData(prev => ({ ...prev, invitationCode: code, organizationId: data.organization_id, organizationName: data.organization_name, })); setStep('personalData'); }
        };
        verifyCodeAndGetOrg();
    }, [searchParams, router, supabase]);

    const particlesLoaded = async (container?: Container): Promise<void> => {};
    const options: ISourceOptions = useMemo(() => ({ background: { color: { value: "transparent" } }, fpsLimit: 60, interactivity: { events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" }, }, modes: { push: { quantity: 4 }, repulse: { distance: 100, duration: 0.4 }, }, }, particles: { color: { value: "#ffffff" }, links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.4, width: 1 }, move: { direction: "none", enable: true, outModes: { default: "out" }, random: false, speed: 2, straight: false }, number: { density: { enable: true }, value: 80 }, opacity: { value: 0.5 }, shape: { type: "circle" }, size: { value: { min: 1, max: 5 } }, }, detectRetina: true, }), []);

    const handleNextStep = (nextStep: string, data: Partial<FormData> = {}) => { setFormData(prev => ({ ...prev, ...data })); setError(null); setStep(nextStep); };
    const handlePreviousStep = (prevStep: string) => { setError(null); setStep(prevStep); };
    
    const handleRegister = async (finalData: Partial<FormData>) => {
        if (!agreedToTerms) { setError("Você precisa concordar com os Termos de Uso e a Política de Privacidade para continuar."); return; }
        setIsLoading(true);
        setError(null);
        const fullData = { ...formData, ...finalData };
        if (!fullData.email || !fullData.password) { setError("E-mail e senha são obrigatórios."); setIsLoading(false); return; }
        
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email: fullData.email, password: fullData.password, options: { data: { full_name: fullData.fullName } } });
        if (signUpError) { setError(signUpError.message === 'User already registered' ? 'Este e-mail já está em uso.' : 'Erro ao criar usuário: ' + signUpError.message); setIsLoading(false); return; }
        
        if (user) {
            // ** INÍCIO DA CORREÇÃO DEFINITIVA **
            // 1. Insere o novo usuário diretamente na tabela de membros da organização.
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    user_id: user.id,
                    organization_id: fullData.organizationId,
                    role: 'student' // Define o papel padrão como 'student'
                });

            if (memberError) {
                // Se a inserção falhar, registramos o erro mas continuamos,
                // pois o perfil ainda precisa ser criado.
                console.error('Erro ao adicionar usuário à tabela organization_members:', memberError);
                setError(`Ocorreu um erro ao vincular sua conta à instituição: ${memberError.message}. Por favor, contate o suporte.`);
                setIsLoading(false);
                return; // Interrompe a execução para não deixar um usuário órfão.
            }
            // ** FIM DA CORREÇÃO DEFINITIVA **

            const { error: profileError } = await supabase.from('profiles').upsert({
                    id: user.id, 
                    full_name: fullData.fullName,
                    nickname: fullData.nickname,
                    birth_date: fullData.birthDate,
                    pronoun: fullData.pronoun,
                    user_category: fullData.userCategory,
                    cpf: fullData.cpf,
                    serie: fullData.serie,
                    school_name: fullData.organizationName,
                    organization_id: fullData.organizationId,
                    address_cep: fullData.addressCep,
                    address_street: fullData.addressStreet,
                    address_number: fullData.addressNumber,
                    address_complement: fullData.addressComplement,
                    address_neighborhood: fullData.addressNeighborhood,
                    address_city: fullData.addressCity,
                    address_state: fullData.addressState,
                    has_agreed_to_terms: true,
                    has_completed_onboarding: false, 
                    updated_at: new Date().toISOString(),
                });
            if (profileError) { setError(`Erro ao salvar seu perfil: ${profileError.message}.`); } else { await supabase.from('invitation_codes').update({ used_by: user.id }).eq('code', fullData.invitationCode!); setStep('success'); }
        }
        setIsLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case 'verifying': return <div className="text-center p-8">Verificando código...</div>;
            case 'personalData': return <PersonalDataStep onNext={(data) => handleNextStep('addressData', data)} onBack={() => router.push('/login/institucional')} initialData={formData} />;
            case 'addressData': return <AddressDataStep onNext={(data) => handleNextStep('authSetup', data)} onBack={() => handlePreviousStep('personalData')} initialData={formData} />;
            case 'authSetup': return <AuthStep onNext={(data) => handleNextStep('personalization', data)} onBack={() => handlePreviousStep('addressData')} initialData={formData} />;
            case 'personalization': return <PersonalizationStep onSubmit={handleRegister} onBack={() => handlePreviousStep('authSetup')} isLoading={isLoading} agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} initialData={formData} />;
            case 'success': return <SuccessStep />;
            default: return <div className="text-center p-8">Carregando...</div>;
        }
    };

    if (!init) { return <div className="min-h-screen bg-royal-blue" />; }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
            <Particles id="tsparticles" options={options} className="absolute inset-0 z-0" />
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg z-10">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold">Cadastro Institucional</h2>
                    <p className="text-text-muted">Você está se juntando à instituição:</p>
                    <p className="font-bold text-lg text-royal-blue">{formData.organizationName || 'Carregando...'}</p>
                </div>
                {renderStep()}
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
}

export default function InstitutionalRegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-royal-blue flex items-center justify-center text-white">Carregando...</div>}>
            <InstitutionalRegister />
        </Suspense>
    );
}
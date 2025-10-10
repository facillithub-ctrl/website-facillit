"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";


// --- Tipos de Dados ---
type FormData = {
    userCategory?: string;
    fullName?: string;
    birthDate?: string;
    cpf?: string | null;
    email?: string;
    password?: string;
    nickname?: string;
    pronoun?: string;
    schoolName?: string;
    addressCep?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    isInstitutional?: boolean;
    organizationId?: string | null;
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

const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
    <div className="text-center flex flex-col h-full justify-center">
        <h2 className="text-2xl font-bold mb-2">Seja bem-vindo(a) ao Facillit Hub!</h2>
        <p className="text-text-muted mb-6">Vamos criar sua conta para começar.</p>
        <div className="space-y-4">
            <button onClick={onNext} className="w-full py-3 px-4 bg-royal-blue text-white rounded-lg font-bold hover:bg-opacity-90 transition">Criar minha conta</button>
            <div className="text-sm text-text-muted">Já tem uma conta? <Link href="/login" className="font-bold text-royal-blue">Acessar</Link></div>
        </div>
    </div>
);

const ProfileSelectStep = ({ onNext, onBack }: { onNext: (category: string) => void, onBack: () => void }) => {
    const profiles = [
        { key: 'aluno', label: 'Sou Aluno(a)' }, 
        { key: 'vestibulando', label: 'Sou Vestibulando(a)' },
        { key: 'professor', label: 'Sou Professor(a)' },
        { key: 'diretor', label: 'Sou Diretor de Escola / Professor Autônomo' }
    ];
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Como você se identifica?</h2>
            <div className="grid grid-cols-2 gap-3">
                {profiles.map(p => <button key={p.key} onClick={() => onNext(p.key)} className="py-4 px-2 bg-gray-50 rounded-lg border hover:border-royal-blue hover:bg-white font-medium transition-all">{p.label}</button>)}
            </div>
            <button onClick={onBack} className="text-sm text-text-muted hover:text-dark-text mt-6">Voltar</button>
        </div>
    );
};

const PersonalDataStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onNext({ fullName: e.currentTarget.fullName.value, birthDate: e.currentTarget.birthDate.value, cpf: e.currentTarget.cpf.value || null });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <h2 className="text-xl font-bold text-center mb-4">Seus Dados Pessoais</h2>
            <div><label htmlFor="fullName" className="font-medium">Nome Completo</label><input type="text" name="fullName" defaultValue={initialData.fullName} required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="birthDate" className="font-medium">Data de Nascimento</label><input type="date" name="birthDate" defaultValue={initialData.birthDate} required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="cpf" className="font-medium">CPF (Opcional)</label><input type="text" name="cpf" defaultValue={initialData.cpf ?? ''} placeholder="000.000.000-00" className="w-full p-2 border rounded-md mt-1" /></div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const AddressDataStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const [address, setAddress] = useState({
        street: initialData.addressStreet || '',
        neighborhood: initialData.addressNeighborhood || '',
        city: initialData.addressCity || '',
        state: initialData.addressState || ''
    });
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState<string | null>(null);

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        setCepLoading(true);
        setCepError(null);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                setCepError("CEP não encontrado. Por favor, verifique.");
                setAddress({ street: '', neighborhood: '', city: '', state: '' });
            } else {
                setAddress({
                    street: data.logouro || '',
                    neighborhood: data.bairro || '',
                    city: data.localidade || '',
                    state: data.uf || ''
                });
            }
        } catch (error) {
            setCepError("Erro ao buscar o CEP. Tente novamente.");
        } finally {
            setCepLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        onNext({
            addressCep: form.cep.value,
            addressStreet: address.street,
            addressNumber: form.number.value,
            addressComplement: form.complement.value,
            addressNeighborhood: address.neighborhood,
            addressCity: address.city,
            addressState: address.state,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <h3 className="text-xl font-bold text-center mb-4">Seu Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <label htmlFor="cep" className="font-medium">CEP</label>
                    <input type="text" name="cep" onBlur={handleCepBlur} defaultValue={initialData.addressCep || ''} required className="w-full p-2 border rounded-md mt-1" />
                    {cepLoading && <p className="text-xs text-blue-500 mt-1">A procurar endereço...</p>}
                    {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                </div>
                
                <div><label htmlFor="street" className="font-medium">Rua</label><input type="text" name="street" value={address.street || ''} onChange={e => setAddress(a => ({...a, street: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="number" className="font-medium">Número</label><input type="text" name="number" defaultValue={initialData.addressNumber || ''} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="complement" className="font-medium">Complemento</label><input type="text" name="complement" defaultValue={initialData.addressComplement || ''} className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="neighborhood" className="font-medium">Bairro</label><input type="text" name="neighborhood" value={address.neighborhood || ''} onChange={e => setAddress(a => ({...a, neighborhood: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="city" className="font-medium">Cidade</label><input type="text" name="city" value={address.city || ''} onChange={e => setAddress(a => ({...a, city: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="state" className="font-medium">Estado</label><input type="text" name="state" value={address.state || ''} onChange={e => setAddress(a => ({...a, state: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
            </div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const InstitutionalStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const [isInstitutional, setIsInstitutional] = useState(initialData.isInstitutional ?? true);
    const [schoolName, setSchoolName] = useState(initialData.schoolName || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({ isInstitutional, schoolName: isInstitutional ? schoolName : undefined });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Vínculo Institucional</h2>
            <p className="text-sm text-center text-text-muted mb-4">Você estuda ou trabalha em alguma instituição de ensino?</p>
            <div className="flex justify-center gap-4">
                <button type="button" onClick={() => setIsInstitutional(true)} className={`py-2 px-6 rounded-lg font-bold border-2 ${isInstitutional ? 'bg-royal-blue text-white border-royal-blue' : 'bg-transparent border-gray-300'}`}>Sim</button>
                <button type="button" onClick={() => setIsInstitutional(false)} className={`py-2 px-6 rounded-lg font-bold border-2 ${!isInstitutional ? 'bg-royal-blue text-white border-royal-blue' : 'bg-transparent border-gray-300'}`}>Não</button>
            </div>
            {isInstitutional && (
                <div className="animate-fade-in-right">
                    <label htmlFor="schoolName" className="font-medium text-sm">Nome da Escola / Instituição</label>
                    <input 
                        type="text" 
                        name="schoolName" 
                        value={schoolName} 
                        onChange={e => setSchoolName(e.target.value)}
                        required 
                        className="w-full p-2 border rounded-md mt-1" 
                        placeholder="Ex: Colégio Facillit"
                    />
                </div>
            )}
            <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button>
                <button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button>
            </div>
        </form>
    );
};

const AuthStep = ({ onNext, onBack, initialData }: { onNext: (data: Partial<FormData>) => void, onBack: () => void, initialData: FormData }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({ length: false, uppercase: false, number: false });

    useEffect(() => {
        setPasswordCriteria({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
        });
    }, [password]);

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
            <div><label htmlFor="email" className="block text-sm font-medium mb-1">Seu melhor e-mail</label><input type="email" name="email" defaultValue={initialData.email} required className="w-full p-3 border rounded-lg" /></div>
            <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium mb-1">Crie uma senha</label>
                <input type={showPassword ? 'text' : 'password'} name="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-text-muted">
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
            </div>
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
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ nickname: e.currentTarget.nickname.value, pronoun: e.currentTarget.pronoun.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">Quase lá! Personalize seu perfil</h2>
            <div><label htmlFor="nickname" className="block text-sm font-medium mb-1">Como gostaria de ser chamado(a)? (Apelido)</label><input type="text" name="nickname" defaultValue={initialData.nickname} className="w-full p-3 border rounded-lg" /></div>
            <div><label htmlFor="pronoun" className="block text-sm font-medium mb-1">Pronome</label><select name="pronoun" defaultValue={initialData.pronoun} className="w-full p-3 border rounded-lg bg-white"><option>Ele/Dele</option><option>Ela/Dela</option><option>Elu/Delu</option><option>Prefiro não informar</option></select></div>
            <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-5 w-5 mt-1 rounded border-gray-300 text-royal-blue focus:ring-royal-blue flex-shrink-0"
                    />
                    <span className="text-sm text-gray-600">
                        Eu li e concordo com os <Link href="/recursos/uso" target="_blank" className="font-bold text-royal-blue underline">Termos de Uso</Link> e a <Link href="/recursos/privacidade" target="_blank" className="font-bold text-royal-blue underline">Política de Privacidade</Link>.
                    </span>
                </label>
            </div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" disabled={isLoading || !agreedToTerms} className="py-3 px-6 bg-royal-blue text-white rounded-lg font-bold disabled:bg-gray-400">{isLoading ? 'Finalizando...' : 'Finalizar Cadastro'}</button></div>
        </form>
    );
};

const SuccessStep = () => {
    const router = useRouter();
    const goToLogin = () => {
        router.push('/login');
    };
    return (
        <div className="text-center flex flex-col h-full justify-center">
            <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4"><i className="fas fa-check text-3xl"></i></div>
            <h2 className="text-2xl font-bold mb-2">Conta criada com sucesso!</h2>
            <p className="text-text-muted mb-6">Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada para ativar sua conta.</p>
            <button onClick={goToLogin} className="w-full py-3 bg-royal-blue text-white rounded-lg font-bold">Ir para o Login</button>
        </div>
    );
};


// --- Componente Principal ---
export default function RegisterPage() {
    const [step, setStep] = useState('welcome');
    const [formData, setFormData] = useState<FormData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const [init, setInit] = useState(false);

    useEffect(() => {
      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        setInit(true);
      });
    }, []);

    const particlesLoaded = async (container?: Container): Promise<void> => {};

    const options: ISourceOptions = useMemo(
        () => ({
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: { enable: true, mode: "push" },
              onHover: { enable: true, mode: "repulse" },
            },
            modes: {
              push: { quantity: 4 },
              repulse: { distance: 100, duration: 0.4 },
            },
          },
          particles: {
            color: { value: "#ffffff" },
            links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.4, width: 1 },
            move: { direction: "none", enable: true, outModes: { default: "out" }, random: false, speed: 2, straight: false },
            number: { density: { enable: true }, value: 80 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }),
        [],
      );

    const handleNextStep = (nextStep: string, data: Partial<FormData> = {}) => {
        setFormData(prev => ({ ...prev, ...data }));
        setError(null);
        setStep(nextStep);
    };

    const handlePreviousStep = (prevStep: string) => {
        setError(null);
        setStep(prevStep);
    };

    const handleRegister = async (finalData: Partial<FormData>) => {
        if (!agreedToTerms) {
            setError("Você precisa concordar com os Termos de Uso e a Política de Privacidade para continuar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        const fullData = { ...formData, ...finalData };

        if (!fullData.email || !fullData.password) {
            setError("E-mail e senha são obrigatórios.");
            setIsLoading(false);
            return;
        }

        let organizationId: string | null = null;
        if (fullData.isInstitutional && fullData.schoolName) {
            const { data: existingOrg, error: findError } = await supabase
                .from('organizations')
                .select('id')
                .eq('name', fullData.schoolName)
                .single();
            
            if (findError && findError.code !== 'PGRST116') {
                setError(`Erro ao verificar instituição: ${findError.message}`);
                setIsLoading(false);
                return;
            }

            if (existingOrg) {
                organizationId = existingOrg.id;
            } else {
                const { data: newOrg, error: createError } = await supabase
                    .from('organizations')
                    .insert({ name: fullData.schoolName })
                    .select()
                    .single();
                
                if (createError) {
                    setError(`Erro ao criar nova instituição: ${createError.message}`);
                    setIsLoading(false);
                    return;
                }
                organizationId = newOrg.id;
            }
        }
        
        fullData.organizationId = organizationId;

        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email: fullData.email,
            password: fullData.password,
            options: { data: { full_name: fullData.fullName } }
        });

        if (signUpError) {
            setError(signUpError.message === 'User already registered' ? 'Este e-mail já está em uso.' : 'Erro ao criar usuário: ' + signUpError.message);
            setIsLoading(false);
            return;
        }
        
        if (user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id, 
                    full_name: fullData.fullName,
                    nickname: fullData.nickname,
                    birth_date: fullData.birthDate,
                    pronoun: fullData.pronoun,
                    user_category: fullData.userCategory,
                    cpf: fullData.cpf,
                    school_name: fullData.schoolName,
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

            if (profileError) {
                console.error('Erro ao fazer upsert do perfil:', profileError);
                setError(`Erro ao salvar seu perfil: ${profileError.message}. Seu cadastro foi cancelado. Por favor, tente novamente.`);
            } else {
                setStep('success');
            }
        }
        setIsLoading(false);
    };
  
    const renderStep = () => {
        switch (step) {
            case 'welcome':
                return <WelcomeStep onNext={() => handleNextStep('profileSelect')} />;
            case 'profileSelect':
                return <ProfileSelectStep onNext={(cat) => handleNextStep('personalData', { userCategory: cat })} onBack={() => handlePreviousStep('welcome')} />;
            case 'personalData':
                return <PersonalDataStep onNext={(data) => handleNextStep('addressData', data)} onBack={() => handlePreviousStep('profileSelect')} initialData={formData} />;
            case 'addressData':
                return <AddressDataStep onNext={(data) => handleNextStep('institutional', data)} onBack={() => handlePreviousStep('personalData')} initialData={formData} />;
            case 'institutional':
                return <InstitutionalStep onNext={(data) => handleNextStep('authSetup', data)} onBack={() => handlePreviousStep('addressData')} initialData={formData} />;
            case 'authSetup':
                return <AuthStep onNext={(data) => handleNextStep('personalization', data)} onBack={() => handlePreviousStep('institutional')} initialData={formData} />;
            case 'personalization':
                return <PersonalizationStep onSubmit={handleRegister} onBack={() => handlePreviousStep('authSetup')} isLoading={isLoading} agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} initialData={formData} />;
            case 'success':
                return <SuccessStep />;
            default:
                return <WelcomeStep onNext={() => handleNextStep('profileSelect')} />;
        }
    };

    if (!init) {
      return <div className="min-h-screen bg-royal-blue" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
            <Particles id="tsparticles" options={options} className="absolute inset-0 z-0" />
            <div className="w-full max-w-4xl rounded-2xl shadow-lg flex overflow-hidden my-8 z-10">
                <div className="hidden md:flex flex-1 items-center justify-center p-5">
                    <Image src="/assets/images/MASCOTE/criar.png" alt="Mascote Facillit Hub" width={400} height={400} priority />
                </div>
                <div className="flex-1 p-8 flex flex-col bg-white animate-fade-in-right relative">
                    <Link href="/" className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <i className="fas fa-arrow-left"></i> Tela Inicial
                    </Link>
                    <div className="mb-8 flex justify-center">
                        <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo Facillit Hub" width={48} height={48} />
                    </div>
                    <div className="flex-grow">
                        {renderStep()}
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
}
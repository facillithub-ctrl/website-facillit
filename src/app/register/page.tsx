// Caminho: src/app/register/page.tsx

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
    cpf?: string;
    email?: string;
    password?: string;
    nickname?: string;
    pronoun?: string;
    schoolName?: string;
    registrationNumber?: string;
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
            const isDirector = fullData.userCategory === 'diretor';
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
                    address_cep: fullData.addressCep,
                    address_street: fullData.addressStreet,
                    address_number: fullData.addressNumber,
                    address_complement: fullData.addressComplement,
                    address_neighborhood: fullData.addressNeighborhood,
                    address_city: fullData.addressCity,
                    address_state: fullData.addressState,
                    category_details: fullData.categoryDetails,
                    has_agreed_to_terms: true,
                    verification_status: isDirector ? 'pending' : 'approved',
                    has_completed_onboarding: false, 
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error('Erro ao fazer upsert do perfil:', profileError);
                setError(`Erro ao salvar seu perfil: ${profileError.message}. Seu cadastro foi cancelado. Por favor, tente novamente.`);
            } else {
                setStep(isDirector ? 'pendingApproval' : 'success');
            }
        }
        setIsLoading(false);
    };
  
    const renderStep = () => {
        const steps: { [key: string]: React.ReactNode } = {
            'welcome': <WelcomeStep onNext={() => handleNextStep('profileSelect')} />,
            'profileSelect': <ProfileSelectStep onNext={(cat) => handleNextStep('personalData', { userCategory: cat })} onBack={() => handlePreviousStep('welcome')} />,
            'personalData': <PersonalDataStep onNext={(data) => handleNextStep('addressData', data)} onBack={() => handlePreviousStep('profileSelect')} />,
            'addressData': <AddressDataStep onNext={(data) => handleNextStep('categoryData', data)} onBack={() => handlePreviousStep('personalData')} />,
            'categoryData': <CategoryDataStep userCategory={formData.userCategory!} onNext={(data) => handleNextStep('authSetup', data)} onBack={() => handlePreviousStep('addressData')} />,
            'authSetup': <AuthStep onNext={(data) => handleNextStep('personalization', data)} onBack={() => handlePreviousStep('categoryData')} />,
            'personalization': <PersonalizationStep 
                                    onSubmit={handleRegister} 
                                    onBack={() => handlePreviousStep('authSetup')} 
                                    isLoading={isLoading}
                                    agreedToTerms={agreedToTerms}
                                    setAgreedToTerms={setAgreedToTerms}
                                />,
            'success': <SuccessStep />,
            'pendingApproval': <PendingApprovalStep />,
        };
        return steps[step] || steps['welcome'];
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

// --- Componentes de Etapa (mantidos como no código original) ---

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

const PersonalDataStep = ({ onNext, onBack }: { onNext: (data: Partial<FormData>) => void, onBack: () => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onNext({ fullName: e.currentTarget.fullName.value, birthDate: e.currentTarget.birthDate.value, cpf: e.currentTarget.cpf.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <h2 className="text-xl font-bold text-center mb-4">Seus Dados Pessoais</h2>
            <div><label htmlFor="fullName" className="font-medium">Nome Completo</label><input type="text" name="fullName" required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="birthDate" className="font-medium">Data de Nascimento</label><input type="date" name="birthDate" required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="cpf" className="font-medium">CPF</label><input type="text" name="cpf" required placeholder="000.000.000-00" className="w-full p-2 border rounded-md mt-1" /></div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const AddressDataStep = ({ onNext, onBack }: { onNext: (data: Partial<FormData>) => void, onBack: () => void }) => {
    const [address, setAddress] = useState({ street: '', neighborhood: '', city: '', state: '' });

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setAddress({ street: data.logouro, neighborhood: data.bairro, city: data.localidade, state: data.uf });
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
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
                <div><label htmlFor="cep" className="font-medium">CEP</label><input type="text" name="cep" onBlur={handleCepBlur} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="street" className="font-medium">Rua</label><input type="text" name="street" value={address.street} onChange={e => setAddress(a => ({...a, street: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="number" className="font-medium">Número</label><input type="text" name="number" required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="complement" className="font-medium">Complemento</label><input type="text" name="complement" className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="neighborhood" className="font-medium">Bairro</label><input type="text" name="neighborhood" value={address.neighborhood} onChange={e => setAddress(a => ({...a, neighborhood: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="city" className="font-medium">Cidade</label><input type="text" name="city" value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="state" className="font-medium">Estado</label><input type="text" name="state" value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))} required className="w-full p-2 border rounded-md mt-1" /></div>
            </div>
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const CategoryDataStep = ({ userCategory, onNext, onBack }: { userCategory: string, onNext: (data: Partial<FormData>) => void, onBack: () => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        onNext({
            schoolName: form.schoolName?.value,
            categoryDetails: {
                serie: form.serie?.value,
                subjects: Array.from((form.querySelectorAll('input[name="subjects"]:checked') as NodeListOf<HTMLInputElement>)).map(el => el.value),
                experience: form.experience?.value,
                institutionType: form.institutionType?.value,
                position: form.position?.value,
                phone: form.phone?.value,
                vestibularYear: form.vestibularYear?.value,
                desiredCourse: form.desiredCourse?.value,
            }
        });
    };
    
    const fields = useMemo(() => {
        switch (userCategory) {
            case 'aluno': return <><div><label htmlFor="schoolName">Nome da sua Escola</label><input type="text" name="schoolName" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="serie">Série / Ano</label><select name="serie" required className="w-full p-2 border rounded-md mt-1 bg-white"><option>Não estou na escola</option><optgroup label="Ensino Fundamental">{[...Array(9)].map((_, i) => <option key={i}>{i + 1}º Ano</option>)}</optgroup><optgroup label="Ensino Médio">{[...Array(3)].map((_, i) => <option key={i}>{i + 1}º Ano</option>)}</optgroup></select></div></>;
            case 'professor': return <><div><span className="font-medium">Disciplinas que leciona</span><div className="grid grid-cols-2 gap-2 mt-2">{['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Artes', 'Inglês', 'Ed. Física'].map(m => <label key={m} className="flex items-center gap-2"><input type="checkbox" name="subjects" value={m} />{m}</label>)}</div></div><div><label htmlFor="experience">Tempo de experiência</label><select name="experience" className="w-full p-2 border rounded-md mt-1 bg-white"><option>Menos de 1 ano</option><option>1 a 3 anos</option><option>4 a 6 anos</option><option>Mais de 6 anos</option></select></div></>;
            case 'diretor': return <><div><label htmlFor="schoolName">Nome da Instituição (ou Autônomo)</label><input type="text" name="schoolName" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="position">Seu Cargo</label><input type="text" name="position" required placeholder="Ex: Diretor(a), Coordenador(a)" className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="phone">Telefone para Contato</label><input type="tel" name="phone" required placeholder="(XX) XXXXX-XXXX" className="w-full p-2 border rounded-md mt-1" /></div></>;
            case 'vestibulando': return <><div><label htmlFor="vestibularYear">Ano que pretende prestar vestibular</label><input type="number" name="vestibularYear" placeholder="Ex: 2025" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="desiredCourse">Curso Desejado</label><input type="text" name="desiredCourse" className="w-full p-2 border rounded-md mt-1" /></div></>;
            default: return null;
        }
    }, [userCategory]);

    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <h2 className="text-xl font-bold text-center mb-4">Detalhes do seu Perfil</h2>
            {fields}
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" className="py-2 px-5 bg-royal-blue text-white rounded-lg font-bold">Próximo</button></div>
        </form>
    );
};

const AuthStep = ({ onNext, onBack }: { onNext: (data: Partial<FormData>) => void, onBack: () => void }) => {
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
            <div><label htmlFor="email" className="block text-sm font-medium mb-1">Seu melhor e-mail</label><input type="email" name="email" required className="w-full p-3 border rounded-lg" /></div>
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

const PersonalizationStep = ({ onSubmit, onBack, isLoading, agreedToTerms, setAgreedToTerms }: { onSubmit: (data: Partial<FormData>) => void, onBack: () => void, isLoading: boolean, agreedToTerms: boolean, setAgreedToTerms: (value: boolean) => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ nickname: e.currentTarget.nickname.value, pronoun: e.currentTarget.pronoun.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">Quase lá! Personalize seu perfil</h2>
            <div><label htmlFor="nickname" className="block text-sm font-medium mb-1">Como gostaria de ser chamado(a)? (Apelido)</label><input type="text" name="nickname" className="w-full p-3 border rounded-lg" /></div>
            <div><label htmlFor="pronoun" className="block text-sm font-medium mb-1">Pronome</label><select name="pronoun" className="w-full p-3 border rounded-lg bg-white"><option>Ele/Dele</option><option>Ela/Dela</option><option>Elu/Delu</option><option>Prefiro não informar</option></select></div>
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
        router.refresh(); 
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

const PendingApprovalStep = () => {
    const router = useRouter();
    return (
        <div className="text-center flex flex-col h-full justify-center">
            <div className="mx-auto bg-blue-100 text-royal-blue w-16 h-16 rounded-full flex items-center justify-center mb-4"><i className="fas fa-hourglass-half text-3xl"></i></div>
            <h2 className="text-2xl font-bold mb-2">Cadastro Recebido!</h2>
            <p className="text-text-muted mb-6">Seus dados foram enviados para análise. Nossa equipe entrará em contato por e-mail para os próximos passos.</p>
            <button onClick={() => router.push('/')} className="w-full py-3 bg-royal-blue text-white rounded-lg font-bold">Voltar para a Página Inicial</button>
        </div>
    );
};
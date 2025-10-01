"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';

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
    const router = useRouter(); // router é usado em SuccessStep
    const supabase = createClient();

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
            setError("Você precisa de concordar com os Termos de Uso e a Política de Privacidade para continuar.");
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
            options: {
                data: {
                    full_name: fullData.fullName,
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message === 'User already registered' ? 'Este e-mail já está em uso.' : 'Erro ao criar utilizador: ' + signUpError.message);
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
                    registration_number: fullData.registrationNumber,
                    address_cep: fullData.addressCep,
                    address_street: fullData.addressStreet,
                    address_number: fullData.addressNumber,
                    address_complement: fullData.addressComplement,
                    address_neighborhood: fullData.addressNeighborhood,
                    address_city: fullData.addressCity,
                    address_state: fullData.addressState,
                    category_details: fullData.categoryDetails,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error('Erro ao fazer upsert do perfil:', profileError);
                setError(`Erro ao guardar o seu perfil: ${profileError.message}. O seu registo foi cancelado. Por favor, tente novamente.`);
            } else {
                setStep('success');
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
        };
        return steps[step] || steps['welcome'];
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
            <Link href="/" className="fixed top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors"><i className="fas fa-arrow-left"></i> Voltar</Link>
            <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg flex overflow-hidden my-8">
                <div className="hidden md:flex flex-1 items-center justify-center p-5 bg-white/20"><Image src="/assets/images/MASCOTE/criar.png" alt="Mascote Facillit Hub" width={400} height={400} priority /></div>
                <div className="flex-1 p-8 flex flex-col"><div className="mb-8 flex justify-center"><Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo Facillit Hub" width={48} height={48} /></div><div className="flex-grow">{renderStep()}</div>{error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}</div>
            </div>
        </div>
    );
}


// --- Componentes de Cena (sem alterações) ---
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
    <div className="text-center flex flex-col h-full justify-center">
        <h2 className="text-2xl font-bold mb-2">Olá! É a sua primeira vez por aqui?</h2>
        <div className="space-y-4 mt-6">
            <button onClick={onNext} className="w-full py-3 px-4 bg-royal-blue text-white rounded-lg font-bold hover:bg-opacity-90 transition">Criar a minha conta</button>
            <div className="text-sm text-text-muted">Já tem uma conta? <Link href="/login" className="font-bold text-royal-blue">Aceder</Link></div>
        </div>
    </div>
);

const ProfileSelectStep = ({ onNext, onBack }: { onNext: (category: string) => void, onBack: () => void }) => {
    const profiles = [{ key: 'aluno', label: 'Sou Aluno(a)' }, { key: 'professor', label: 'Sou Professor(a)' }, { key: 'gestor', label: 'Sou Gestor(a)' }, { key: 'vestibulando', label: 'Sou Vestibulando(a)' }];
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Em qual destes grupos você se enquadra?</h2>
            <div className="grid grid-cols-2 gap-3">
                {profiles.map(p => <button key={p.key} onClick={() => onNext(p.key)} className="py-4 px-2 bg-white/50 rounded-lg border hover:border-royal-blue hover:bg-white font-medium transition-all">{p.label}</button>)}
            </div>
            <button onClick={onBack} className="text-sm text-text-muted hover:text-dark-text mt-6">Voltar</button>
        </div>
    );
};
const PersonalDataStep = ({ onNext, onBack }: { onNext: (data: Partial<FormData>) => void, onBack: () => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onNext({ fullName: e.currentTarget.fullName.value, birthDate: e.currentTarget.birthDate.value });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <h2 className="text-xl font-bold text-center mb-4">Os seus Dados Pessoais</h2>
            <div><label htmlFor="fullName" className="font-medium">Nome Completo</label><input type="text" name="fullName" required className="w-full p-2 border rounded-md mt-1" /></div>
            <div><label htmlFor="birthDate" className="font-medium">Data de Nascimento</label><input type="date" name="birthDate" required className="w-full p-2 border rounded-md mt-1" /></div>
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
                setAddress({ street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf });
            }
        } catch (error) {
            console.error("Erro ao procurar CEP:", error);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        onNext({ addressCep: form.cep.value, addressStreet: form.street.value, addressNumber: form.number.value, addressComplement: form.complement.value, addressNeighborhood: form.neighborhood.value, addressCity: form.city.value, addressState: form.state.value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <h3 className="text-xl font-bold text-center mb-4">A sua Morada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label htmlFor="cep" className="font-medium">Código Postal</label><input type="text" name="cep" onBlur={handleCepBlur} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="street" className="font-medium">Rua</label><input type="text" name="street" defaultValue={address.street} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="number" className="font-medium">Número</label><input type="text" name="number" required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="complement" className="font-medium">Complemento</label><input type="text" name="complement" className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="neighborhood" className="font-medium">Bairro</label><input type="text" name="neighborhood" defaultValue={address.neighborhood} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="city" className="font-medium">Cidade</label><input type="text" name="city" defaultValue={address.city} required className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label htmlFor="state" className="font-medium">Estado</label><input type="text" name="state" defaultValue={address.state} required className="w-full p-2 border rounded-md mt-1" /></div>
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
            cpf: form.cpf?.value, schoolName: form.schoolName?.value,
            categoryDetails: {
                serie: form.serie?.value,
                subjects: Array.from((form.querySelectorAll('input[name="subjects"]:checked') as NodeListOf<HTMLInputElement>)).map(el => el.value),
                experience: form.experience?.value,
                institutionType: form.institutionType?.value,
                vestibularYear: form.vestibularYear?.value,
                desiredCourse: form.desiredCourse?.value,
            }
        });
    };
    
    const fields = useMemo(() => {
        switch (userCategory) {
            case 'aluno': return <><div><label htmlFor="schoolName" className="font-medium">Nome da sua Escola</label><input type="text" name="schoolName" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="serie" className="font-medium">Série / Ano</label><select name="serie" required className="w-full p-2 border rounded-md mt-1 bg-white"><option>Não estou na escola</option><optgroup label="Ensino Básico">{[...Array(9)].map((_, i) => <option key={i}>{i + 1}º Ano</option>)}</optgroup><optgroup label="Ensino Secundário">{[...Array(3)].map((_, i) => <option key={i}>{i + 10}º Ano</option>)}</optgroup></select></div></>;
            case 'professor': return <><div><label htmlFor="cpf" className="font-medium">NIF</label><input type="text" name="cpf" required className="w-full p-2 border rounded-md mt-1" /></div><div><span className="font-medium">Disciplinas que leciona</span><div className="grid grid-cols-2 gap-2 mt-2">{['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Artes', 'Inglês', 'Ed. Física'].map(m => <label key={m} className="flex items-center gap-2"><input type="checkbox" name="subjects" value={m} />{m}</label>)}</div></div><div><label htmlFor="experience" className="font-medium">Tempo de experiência</label><select name="experience" className="w-full p-2 border rounded-md mt-1 bg-white"><option>Menos de 1 ano</option><option>1 a 3 anos</option><option>4 a 6 anos</option><option>Mais de 6 anos</option></select></div></>;
            case 'gestor': return <><div><label htmlFor="cpf" className="font-medium">NIF</label><input type="text" name="cpf" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="schoolName" className="font-medium">Nome da Instituição</label><input type="text" name="schoolName" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="institutionType" className="font-medium">Tipo de Instituição</label><select name="institutionType" className="w-full p-2 border rounded-md mt-1 bg-white"><option>Pública</option><option>Privada</option></select></div></>;
            case 'vestibulando': return <><div><label htmlFor="vestibularYear" className="font-medium">Ano em que pretende concorrer à universidade</label><input type="number" name="vestibularYear" placeholder="Ex: 2025" required className="w-full p-2 border rounded-md mt-1" /></div><div><label htmlFor="desiredCourse" className="font-medium">Curso Desejado</label><input type="text" name="desiredCourse" className="w-full p-2 border rounded-md mt-1" /></div></>;
            default: return <p className="text-center text-text-muted">Detalhes adicionais não são necessários para este perfil.</p>;
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
        if (form.password.value !== form.confirmPassword.value) { alert("As palavras-passe não coincidem!"); return; }
        if (!Object.values(passwordCriteria).every(Boolean)) { alert("A palavra-passe não cumpre todos os requisitos."); return; }
        onNext({ email: form.email.value, password: form.password.value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">Crie os seus dados de acesso</h2>
            <div><label htmlFor="email" className="block text-sm font-medium mb-1">O seu melhor e-mail</label><input type="email" name="email" required className="w-full p-3 border rounded-lg" /></div>
            <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium mb-1">Crie uma palavra-passe</label>
                <input type={showPassword ? 'text' : 'password'} name="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-text-muted">
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
            </div>
            <div className="text-xs space-y-1 text-gray-500">
                <p className={passwordCriteria.length ? 'text-royal-blue' : ''}>{passwordCriteria.length ? '✓' : '•'} Mínimo de 8 caracteres</p>
                <p className={passwordCriteria.uppercase ? 'text-royal-blue' : ''}>{passwordCriteria.uppercase ? '✓' : '•'} Pelo menos uma letra maiúscula</p>
                <p className={passwordCriteria.number ? 'text-royal-blue' : ''}>{passwordCriteria.number ? '✓' : '•'} Pelo menos um número</p>
            </div>
            <div><label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirme a sua palavra-passe</label><input type="password" name="confirmPassword" required className="w-full p-3 border rounded-lg" /></div>
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
            <h2 className="text-2xl font-bold text-center mb-4">Quase lá! Personalize o seu perfil</h2>
            <div><label htmlFor="nickname" className="block text-sm font-medium mb-1">Como gostaria de ser chamado(a)? (Alcunha)</label><input type="text" name="nickname" className="w-full p-3 border rounded-lg" /></div>
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
            <div className="flex justify-between items-center pt-4"><button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-dark-text">Voltar</button><button type="submit" disabled={isLoading || !agreedToTerms} className="py-3 px-6 bg-royal-blue text-white rounded-lg font-bold disabled:bg-gray-400">{isLoading ? 'A finalizar...' : 'Finalizar Registo'}</button></div>
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
            <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-check text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">Conta criada com sucesso!</h2>
            <p className="text-text-muted mb-6">
                Enviámos um e-mail de confirmação. Por favor, verifique a sua caixa de entrada para ativar a sua conta antes de iniciar sessão.
            </p>
            <button onClick={goToLogin} className="w-full py-3 bg-royal-blue text-white rounded-lg font-bold">
                Ir para o Login
            </button>
        </div>
    );
};
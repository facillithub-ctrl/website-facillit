"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { validateInstitutionalCode } from './actions';

export default function InstitutionalLoginPage() {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleValidation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await validateInstitutionalCode(code);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else if (result.redirectPath) {
            router.push(result.redirectPath);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
            <Link href="/login" className="fixed top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <i className="fas fa-arrow-left"></i> Voltar
            </Link>
             <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <div className="mb-8 flex justify-center">
                    <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo Facillit Hub" width={48} height={48} />
                </div>
                <h1 className="text-2xl font-bold text-center mb-2">Acesso Institucional</h1>
                <p className="text-text-muted text-center mb-6">Insira o código fornecido pela sua instituição para continuar.</p>
                <form onSubmit={handleValidation} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-dark-text mb-1">Código de Acesso</label>
                        <input
                            type="text"
                            name="code"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                            placeholder="FHB-XXXXXX"
                            className="w-full p-3 border rounded-lg text-center tracking-widest font-mono"
                        />
                    </div>
                     {error && (<p className="text-red-500 text-sm text-center">{error}</p>)}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 bg-royal-blue text-white rounded-lg font-bold hover:bg-opacity-90 transition disabled:bg-gray-400">
                            {isLoading ? 'Validando...' : 'Validar e Continuar'}
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
}
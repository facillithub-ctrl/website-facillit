"use client";

import { useEffect, useState } from 'react';
import { Essay, EssayCorrection, getEssayDetails, getCorrectionForEssay } from '../actions';

type Props = {
  essayId: string;
  onBack: () => void;
};

// Juntando os tipos para facilitar
type FullEssayDetails = Essay & {
  correction: (EssayCorrection & { profiles: { full_name: string | null } }) | null;
  profiles: { full_name: string | null } | null; // Adicionando o perfil do aluno
};

export default function EssayCorrectionView({ essayId, onBack }: Props) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const essayResult = await getEssayDetails(essayId);
            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);
                setDetails({
                    ...(essayResult.data as FullEssayDetails), // Casting para incluir 'profiles'
                    correction: correctionResult.data || null,
                });
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return <div>Carregando sua redação...</div>;
    if (!details) return <div>Não foi possível carregar os detalhes da redação.</div>;

    const { title, content, correction } = details;

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Voltar para minhas redações
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna da Redação */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="font-bold text-xl mb-4">{title}</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{content}</p>
                </div>
                {/* Coluna da Correção */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xl">Correção</h2>
                        {correction && <div className="text-xl font-bold">Nota Final: {correction.final_grade}</div>}
                    </div>

                    {correction ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                                    <span className="font-medium text-sm">Competência {i}</span>
                                    <span className="font-bold text-sm">{(correction as any)[`grade_c${i}`]}</span>
                                </div>
                            ))}
                            <div>
                                <h3 className="font-bold mt-6 mb-2">Feedback do Corretor</h3>
                                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-md whitespace-pre-wrap">{correction.feedback}</div>
                                <p className="text-xs text-gray-400 mt-2">Corrigido por: {correction.profiles?.full_name}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Sua redação ainda está na fila para ser corrigida.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
// Ação para buscar todas as redações de um aluno
export async function getEssaysForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const { data, error } = await supabase
    .from('essays')
    .select('id, title, status, submitted_at')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false, nullsFirst: true });

  if (error) return { error: error.message };
  return { data };
}
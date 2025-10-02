"use client";

import { useTransition } from 'react';
import { updateUserVerification } from '../../actions';
import { VerificationBadge } from '@/components/VerificationBadge'; // CORRIGIDO

type Student = { 
    id: string; 
    full_name: string | null; 
    user_category: string | null; 
    created_at: string | null;
    verification_badge: string | null;
};

export default function ManageStudents({ students }: { students: Student[] }) {
    const [isPending, startTransition] = useTransition();

    const handleBadgeChange = (studentId: string, badge: string) => {
        startTransition(async () => {
            const newBadge = badge === 'none' ? null : badge;
            const result = await updateUserVerification(studentId, newBadge);
            if (result.error) {
                alert(`Erro: ${result.error}`);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Gerenciar Alunos</h2>
            <p className="text-sm text-gray-500 mb-4">Total de Alunos e Vestibulandos: {students.length}</p>
            <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Ação (Atribuir Selo)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} className="border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-dark-text dark:text-white flex items-center gap-2">
                                  {s.full_name}
                                  <VerificationBadge badge={s.verification_badge} />
                                </td>
                                <td className="px-6 py-4 capitalize text-text-muted dark:text-gray-400">{s.user_category}</td>
                                <td className="px-6 py-4">
                                    <select
                                        onChange={(e) => handleBadgeChange(s.id, e.target.value)}
                                        defaultValue={s.verification_badge || 'none'}
                                        disabled={isPending}
                                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="none">Nenhum</option>
                                        <option value="blue">Azul (Identidade Verificada)</option>
                                        <option value="red">Vermelho (Aluno Destaque)</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
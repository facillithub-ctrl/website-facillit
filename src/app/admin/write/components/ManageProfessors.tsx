"use client";

import { useState, useTransition } from 'react';
import { updateUserVerification } from '../../actions';
import { VerificationBadge } from '@/components/VerificationBadge'; // CORRIGIDO

type Professor = { 
  id: string; 
  full_name: string | null; 
  is_verified: boolean | null; 
  created_at: string | null;
  verification_badge: string | null;
};

export default function ManageProfessors({ professors: initialProfessors }: { professors: Professor[] }) {
    const [professors, setProfessors] = useState(initialProfessors);
    const [isPending, startTransition] = useTransition();

    const handleBadgeChange = (professorId: string, badge: string) => {
        startTransition(async () => {
            const newBadge = badge === 'none' ? null : badge;
            const result = await updateUserVerification(professorId, newBadge);
            if (result.error) {
                alert(`Erro ao atualizar professor: ${result.error}`);
            } else {
                setProfessors(profs => profs.map(p => p.id === professorId ? { ...p, verification_badge: newBadge } : p));
            }
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Gerenciar Professores</h2>
            <p className="text-sm text-gray-500 mb-4">Total de Professores: {professors.length}</p>
            <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Ação (Atribuir Selo)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {professors.map(p => (
                            <tr key={p.id} className="border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-dark-text dark:text-white flex items-center gap-2">
                                  {p.full_name}
                                  <VerificationBadge badge={p.verification_badge} />
                                </td>
                                <td className="px-6 py-4">
                                  {p.verification_badge === 'green' ? <span className="text-green-500 font-bold">Verificado</span> : 'Não Verificado'}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        onChange={(e) => handleBadgeChange(p.id, e.target.value)}
                                        defaultValue={p.verification_badge || 'none'}
                                        disabled={isPending}
                                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="none">Nenhum</option>
                                        <option value="green">Verde (Professor)</option>
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
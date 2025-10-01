"use client";

import { useState, useTransition } from 'react';
import { updateProfessorVerification } from '../../actions';

type Professor = { id: string; full_name: string | null; is_verified: boolean | null; created_at: string | null; };

export default function ManageProfessors({ professors: initialProfessors }: { professors: Professor[] }) {
    const [professors, setProfessors] = useState(initialProfessors);
    const [isPending, startTransition] = useTransition();

    const handleToggleVerify = (professorId: string, currentStatus: boolean) => {
        startTransition(async () => {
            setProfessors(profs => profs.map(p => p.id === professorId ? { ...p, is_verified: !currentStatus } : p));
            const result = await updateProfessorVerification(professorId, !currentStatus);
            if (result.error) {
                setProfessors(profs => profs.map(p => p.id === professorId ? { ...p, is_verified: currentStatus } : p));
                alert(`Erro ao atualizar professor: ${result.error}`);
            }
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Gerenciar Professores</h2>
            <p className="text-sm text-gray-500 mb-4">Total de Professores: {professors.length}</p>
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow max-h-96 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {professors.map(p => (
                            <tr key={p.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700">
                                <td className="px-6 py-4 font-medium">{p.full_name}</td>
                                <td className="px-6 py-4">{p.is_verified ? <span className="text-green-500 font-bold">Verificado</span> : 'Não Verificado'}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleToggleVerify(p.id, !!p.is_verified)} disabled={isPending} className="font-medium text-blue-600 dark:text-blue-500 hover:underline disabled:opacity-50">
                                        {p.is_verified ? 'Remover Verificação' : 'Verificar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
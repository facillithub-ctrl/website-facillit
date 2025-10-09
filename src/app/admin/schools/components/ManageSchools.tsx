"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertOrganization, deleteOrganization } from '../../actions';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

type Organization = {
    id: string;
    name: string;
    cnpj: string | null;
    status: string;
    invitation_codes: { code: string }[] | null;
    member_count: number | null;
};

type Props = {
    initialOrganizations: Organization[];
};

export default function ManageSchools({ initialOrganizations }: Props) {
    const [organizations, setOrganizations] = useState(initialOrganizations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrg, setCurrentOrg] = useState<Partial<Organization> | null>(null);
    const [isPending, startTransition] = useTransition();
    const { addToast } = useToast();
    const router = useRouter();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [orgToDelete, setOrgToDelete] = useState<string | null>(null);


    const handleOpenModal = (org: Partial<Organization> | null) => {
        setCurrentOrg(org || { name: '', cnpj: '', status: 'active' });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        // ✅ CORREÇÃO APLICADA AQUI
        if (!currentOrg || !currentOrg.name) {
            addToast({ title: "Erro de Validação", message: "O nome da instituição é obrigatório.", type: 'error' });
            return;
        }
        
        startTransition(async () => {
            // TypeScript agora sabe que 'currentOrg' e 'currentOrg.name' são válidos.
            const result = await upsertOrganization(currentOrg as { id?: string; name: string; cnpj?: string | null; status?: string; });
            if (result.error) {
                addToast({ title: "Erro", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso!", message: "Instituição salva.", type: 'success' });
                setIsModalOpen(false);
                router.refresh(); 
            }
        });
    };
    
    const handleDeleteClick = (orgId: string) => {
        setOrgToDelete(orgId);
        setDeleteModalOpen(true);
    };
    
    const executeDelete = () => {
        if (!orgToDelete) return;
        startTransition(async () => {
            const result = await deleteOrganization(orgToDelete);
            if(result.error) {
                addToast({ title: "Erro", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso", message: "Instituição removida.", type: 'success'});
                router.refresh();
            }
            setDeleteModalOpen(false);
            setOrgToDelete(null);
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
             <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Confirmar Exclusão"
                message="Tem a certeza de que deseja excluir esta instituição? Todos os dados associados (membros, turmas) podem ser perdidos."
                onConfirm={executeDelete}
                onClose={() => setDeleteModalOpen(false)}
                confirmText="Sim, Excluir"
            />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Instituições Cadastradas</h2>
                <button onClick={() => handleOpenModal(null)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg">
                    <i className="fas fa-plus mr-2"></i> Nova Instituição
                </button>
            </div>

            <div className="max-h-[70vh] overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Código Principal</th>
                            <th className="px-6 py-3">Membros</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {organizations.map(org => (
                            <tr key={org.id} className="border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium">{org.name}</td>
                                <td className="px-6 py-4 font-mono">{org.invitation_codes?.[0]?.code || 'N/A'}</td>
                                <td className="px-6 py-4">{org.member_count || 0}</td>
                                <td className="px-6 py-4">{org.status}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleOpenModal(org)} className="text-blue-500 hover:underline">Editar</button>
                                    <button onClick={() => handleDeleteClick(org.id)} className="text-red-500 hover:underline">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentOrg && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-bold">{currentOrg.id ? 'Editar' : 'Nova'} Instituição</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Nome da Instituição" value={currentOrg.name || ''} onChange={e => setCurrentOrg(o => o ? {...o, name: e.target.value} : null)} className="w-full p-2 border rounded" />
                            <input type="text" placeholder="CNPJ (opcional)" value={currentOrg.cnpj || ''} onChange={e => setCurrentOrg(o => o ? {...o, cnpj: e.target.value} : null)} className="w-full p-2 border rounded" />
                             <select value={currentOrg.status || 'active'} onChange={e => setCurrentOrg(o => o ? {...o, status: e.target.value} : null)} className="w-full p-2 border rounded bg-white">
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 py-2 px-4 rounded">Cancelar</button>
                            <button onClick={handleSave} disabled={isPending} className="bg-royal-blue text-white py-2 px-4 rounded disabled:bg-gray-400">
                                {isPending ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
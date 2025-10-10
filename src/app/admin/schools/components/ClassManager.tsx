"use client";

import { useState, useTransition } from 'react';
import { SchoolClass, UserProfile } from '@/app/dashboard/types';
import { createClass, addUserToClass, removeUserFromClass } from '../../actions';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

type ClassManagerProps = {
    organizationId: string;
    initialClasses: (SchoolClass & { members: UserProfile[] })[];
    organizationMembers: UserProfile[];
    initialUnassignedUsers: UserProfile[];
};

export default function ClassManager({ organizationId, initialClasses, organizationMembers, initialUnassignedUsers }: ClassManagerProps) {
    const [classes, setClasses] = useState(initialClasses);
    const [unassignedUsers, setUnassignedUsers] = useState(initialUnassignedUsers);
    const [newClassName, setNewClassName] = useState('');
    const [selectedClass, setSelectedClass] = useState<(SchoolClass & { members: UserProfile[] }) | null>(null);
    const [userToAdd, setUserToAdd] = useState('');
    const [roleToAdd, setRoleToAdd] = useState<'student' | 'teacher'>('student');
    const [isPending, startTransition] = useTransition();
    const { addToast } = useToast();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{classId: string, userId: string} | null>(null);


    const handleCreateClass = async () => {
        if (!newClassName.trim()) {
            addToast({ title: 'Atenção', message: 'O nome da turma não pode estar vazio.', type: 'warning' });
            return;
        }
        startTransition(async () => {
            const result = await createClass(organizationId, newClassName.trim());
            if (result.error) {
                addToast({ title: 'Erro ao Criar Turma', message: result.error, type: 'error' });
            } else if (result.data) {
                setClasses(previousClasses => [...previousClasses, { ...result.data, members: [] }]);
                setNewClassName('');
                addToast({ title: 'Sucesso', message: 'Turma criada com sucesso!', type: 'success' });
            }
        });
    };

    const handleAddUserToClass = async () => {
        if (!userToAdd || !selectedClass) {
            addToast({ title: 'Atenção', message: 'Selecione uma turma e um utilizador para adicionar.', type: 'warning' });
            return;
        }
        startTransition(async () => {
            const result = await addUserToClass(selectedClass.id, userToAdd, roleToAdd);
            if (result.error) {
                addToast({ title: 'Erro ao Adicionar', message: result.error, type: 'error' });
            } else if (result.data) {
                const addedUser = organizationMembers.find(member => member.id === userToAdd);
                if (addedUser) {
                    const updatedClasses = classes.map(currentClass => 
                        currentClass.id === selectedClass.id 
                        ? { ...currentClass, members: [...currentClass.members, { ...addedUser, role: roleToAdd }] } 
                        : currentClass
                    );
                    setClasses(updatedClasses);
                    const newlySelectedClass = updatedClasses.find(c => c.id === selectedClass.id);
                    setSelectedClass(newlySelectedClass || null);
                    setUnassignedUsers(previousUsers => previousUsers.filter(user => user.id !== userToAdd));
                    setUserToAdd('');
                    addToast({ title: 'Sucesso', message: 'Utilizador adicionado à turma!', type: 'success' });
                }
            }
        });
    };
    
    const openConfirmationModal = (classId: string, userId: string) => {
        setMemberToRemove({ classId, userId });
        setModalOpen(true);
    };

    const handleRemoveUserFromClass = () => {
        if (!memberToRemove) return;
        
        startTransition(async () => {
            const { classId, userId } = memberToRemove;
            const result = await removeUserFromClass(classId, userId);
            
            if (result.error) {
                addToast({ title: 'Erro ao Remover', message: result.error, type: 'error' });
            } else {
                const removedUser = organizationMembers.find(member => member.id === userId);
                if (removedUser) {
                    const updatedClasses = classes.map(currentClass =>
                        currentClass.id === classId
                        ? { ...currentClass, members: currentClass.members.filter(member => member.id !== userId) }
                        : currentClass
                    );
                    setClasses(updatedClasses);
                    const newlySelectedClass = updatedClasses.find(c => c.id === classId);
                    setSelectedClass(newlySelectedClass || null);
                    setUnassignedUsers(previousUsers => [...previousUsers, removedUser]);
                    addToast({ title: 'Sucesso', message: 'Utilizador removido da turma!', type: 'success' });
                }
            }
            setModalOpen(false);
            setMemberToRemove(null);
        });
    };

    return (
        <div>
            <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/20">
                <h3 className="font-bold mb-2 dark:text-white">Criar Nova Turma</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Nome da Turma (ex: 3º Ano A)"
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button onClick={handleCreateClass} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition-colors hover:bg-opacity-90">
                        {isPending ? 'Criando...' : 'Criar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <h3 className="font-bold mb-2 dark:text-white">Turmas Existentes</h3>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {classes.map(c => (
                            <li key={c.id}>
                                <button onClick={() => setSelectedClass(c)} className={`w-full text-left p-3 rounded-lg border dark:border-gray-700 transition-all ${selectedClass?.id === c.id ? 'bg-blue-100 border-royal-blue dark:bg-blue-900/30 dark:border-royal-blue' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <p className="font-semibold dark:text-white">{c.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.members.length} {c.members.length === 1 ? 'membro' : 'membros'}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedClass && (
                    <div className="md:col-span-2 p-4 border dark:border-gray-700 rounded-lg">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Gerir Turma: {selectedClass.name}</h3>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 dark:text-white">Adicionar Membro</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select value={userToAdd} onChange={e => setUserToAdd(e.target.value)} className="p-2 border rounded-md flex-grow dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    <option value="">Selecione um utilizador</option>
                                    {unassignedUsers.map(user => <option key={user.id} value={user.id}>{user.fullName} ({user.userCategory})</option>)}
                                </select>
                                <select value={roleToAdd} onChange={e => setRoleToAdd(e.target.value as any)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    <option value="student">Aluno</option>
                                    <option value="teacher">Professor</option>
                                </select>
                                <button onClick={handleAddUserToClass} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition-colors hover:bg-opacity-90">
                                    {isPending ? 'Adicionando...' : 'Adicionar'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2 dark:text-white">Membros da Turma</h4>
                            <ul className="space-y-2 max-h-60 overflow-y-auto">
                                {selectedClass.members.map(member => (
                                    <li key={member.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <span className="dark:text-white">
                                            {member.fullName} <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({member.role === 'teacher' ? 'Professor' : 'Aluno'})</span>
                                        </span>
                                        <button onClick={() => openConfirmationModal(selectedClass.id, member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remover</button>
                                    </li>
                                ))}
                                {selectedClass.members.length === 0 && (
                                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 p-4">Esta turma ainda não tem membros.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
             <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleRemoveUserFromClass}
                title="Confirmar Remoção"
                description="Tem a certeza de que deseja remover este utilizador da turma? Esta ação não pode ser desfeita."
                confirmText="Sim, Remover"
                isDestructive={true}
                isPending={isPending}
            />
        </div>
    );
}
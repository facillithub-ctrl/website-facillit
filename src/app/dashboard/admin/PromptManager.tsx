"use client";

import { useState, useTransition } from "react";
import { EssayPrompt } from "../applications/write/actions";
import { upsertPrompt, deletePrompt } from "./actions";

export default function PromptManager({ initialPrompts }: { initialPrompts: EssayPrompt[] }) {
    const [prompts, setPrompts] = useState(initialPrompts);
    const [isFormOpen, setFormOpen] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState<Partial<EssayPrompt> | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleEdit = (prompt: EssayPrompt) => {
        setCurrentPrompt(prompt);
        setFormOpen(true);
    };

    const handleAddNew = () => {
        setCurrentPrompt(null);
        setFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja deletar este tema?')) {
            await deletePrompt(id);
            setPrompts(prompts.filter(p => p.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            id: currentPrompt?.id,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            source: formData.get('source') as string,
        };

        startTransition(async () => {
            const result = await upsertPrompt(data);
            if (!result.error) {
                // Atualiza a lista localmente para feedback instantâneo
                if (currentPrompt?.id) {
                    setPrompts(prompts.map(p => p.id === result.data.id ? result.data : p));
                } else {
                    setPrompts([result.data, ...prompts]);
                }
                setFormOpen(false);
            } else {
                alert(`Erro: ${result.error.message}`);
            }
        });
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Gerenciar Temas de Redação</h2>
                <button onClick={handleAddNew} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg text-sm">Adicionar Tema</button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg dark:border-gray-700 space-y-4">
                    <input type="text" name="title" defaultValue={currentPrompt?.title} placeholder="Título do Tema" required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    <textarea name="description" defaultValue={currentPrompt?.description} placeholder="Descrição completa do tema" required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 h-24"></textarea>
                    <input type="text" name="source" defaultValue={currentPrompt?.source} placeholder="Fonte (Ex: ENEM 2022)" required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    <div className="flex gap-4">
                        <button type="submit" disabled={isPending} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">{isPending ? 'Salvando...' : 'Salvar'}</button>
                        <button type="button" onClick={() => setFormOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    </div>
                </form>
            )}

            <ul className="divide-y dark:divide-gray-700">
                {prompts.map(prompt => (
                    <li key={prompt.id} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-semibold dark:text-white">{prompt.title}</p>
                            <p className="text-sm text-gray-500">{prompt.source}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(prompt)} className="text-blue-500 hover:text-blue-700"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDelete(prompt.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
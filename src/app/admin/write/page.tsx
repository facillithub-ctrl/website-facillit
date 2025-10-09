import { getWriteModuleData } from '../actions';
import ManageStudents from './components/ManageStudents';
import ManageProfessors from './components/ManageProfessors';
import ManagePrompts from './components/ManagePrompts';

export default async function AdminWritePage() {
    const { data, error } = await getWriteModuleData();

    if (error || !data) {
        return <div className="text-red-500">Erro ao carregar dados: {error || 'Nenhum dado encontrado.'}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-white">Gerenciar Módulo Write</h1>
            
            <div className="space-y-10">
                {/* Garanta que o ManageUpdates NÃO está mais aqui */}
                <ManagePrompts prompts={data.prompts || []} />
                <ManageStudents students={data.students || []} />
                <ManageProfessors professors={data.professors || []} />
            </div>
        </div>
    );
}
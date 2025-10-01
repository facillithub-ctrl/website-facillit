import { getWriteModuleData } from '../actions';
import ManageStudents from './components/ManageStudents';
import ManageProfessors from './components/ManageProfessors';

export default async function AdminWritePage() {
    const { data, error } = await getWriteModuleData();

    if (error || !data) {
        return <div className="text-red-500">Erro ao carregar dados: {error || 'Nenhum dado encontrado.'}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-white">Gerenciar Módulo Write</h1>
            
            <div className="space-y-10">
                <ManageStudents students={data.students || []} />
                <ManageProfessors professors={data.professors || []} />
                
                <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
                    <h2 className="text-xl font-bold mb-2">Gerenciar Temas, Notícias e Vestibulares</h2>
                    <p className="text-sm text-gray-500">A interface para estas seções estará disponível em breve.</p>
                </div>
            </div>
        </div>
    );
}
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
            <h1 className="text-3xl font-bold mb-6">Gerenciar Módulo Write</h1>
            
            {/* Aqui você pode implementar um sistema de abas mais robusto. 
                Por enquanto, vamos exibir os componentes um abaixo do outro. */}
            
            <div className="space-y-8">
                <ManageStudents students={data.students || []} />
                <ManageProfessors professors={data.professors || []} />
                
                {/* Placeholders para outras seções */}
                <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
                    <h2 className="text-2xl font-bold mb-4">Gerenciar Temas</h2>
                    <p className="text-sm text-gray-500">Em breve.</p>
                </div>
                 <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
                    <h2 className="text-2xl font-bold mb-4">Gerenciar Notícias e Vestibulares</h2>
                    <p className="text-sm text-gray-500">Em breve.</p>
                </div>
            </div>
        </div>
    );
}
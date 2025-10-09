import { getUpdates } from './actions';
import ManageUpdates from './components/ManageUpdates';
// CORREÇÃO: Removida a importação de 'Update' pois não é utilizada diretamente aqui.

export default async function AdminUpdatesPage() {
    const { data: updates, error } = await getUpdates();

    if (error) {
        return <div className="text-red-500">Erro ao carregar dados: {error}</div>;
    }

    // A página renderiza apenas o componente de gestão com os dados buscados.
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-white">Gerenciar Atualizações da Plataforma</h1>
            <div className="space-y-10">
                <ManageUpdates updates={updates || []} />
            </div>
        </div>
    );
}
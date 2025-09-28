import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import { getAllPrompts } from './actions';
import PromptManager from './PromptManager';

export default async function AdminDashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_category')
        .eq('id', user.id)
        .single();
    
    // Apenas 'gestor' pode acessar esta página
    if (profile?.user_category !== 'admin') {
        return (
            <div>
                <h1 className="text-2xl font-bold">Acesso Negado</h1>
                <p>Você não tem permissão para visualizar esta página.</p>
            </div>
        );
    }
    
    // Buscar dados iniciais para os componentes
    const promptsResult = await getAllPrompts();

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Painel do Administrador</h1>
            
            <div className="space-y-8">
                {/* Componente para Gerenciar Temas de Redação */}
                <PromptManager initialPrompts={promptsResult.data || []} />
                
                {/* Futuramente, outros componentes podem ser adicionados aqui */}
                {/* <UserManager /> */}
            </div>
        </div>
    );
}
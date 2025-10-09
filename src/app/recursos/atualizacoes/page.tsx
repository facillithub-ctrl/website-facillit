import Header from '@/components/Header';
import Footer from '@/components/Footer';
import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
// CORREÇÃO: Usando um caminho relativo que funciona
import UpdateGroup from '@/app/admin/updates/components/UpdateGroup';
import type { Update } from '@/app/dashboard/types';

// Função para agrupar as atualizações por módulo
const groupUpdatesByModule = (updates: Update[]) => {
    return updates.reduce((acc, update) => {
        const moduleSlug = update.module_slug || 'general';
        if (!acc[moduleSlug]) {
            acc[moduleSlug] = [];
        }
        acc[moduleSlug].push(update);
        return acc;
    }, {} as Record<string, Update[]>);
};

export default async function AtualizacoesPage() {
    const supabase = await createSupabaseServerClient();

    const { data: updates, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

    const groupedUpdates = groupUpdatesByModule(updates || []);

    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_category')
            .eq('id', user.id)
            .single();
        isAdmin = profile?.user_category === 'administrator';
    }

    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 relative">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Histórico de Atualizações</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">Acompanhe as últimas novidades, melhorias e correções da plataforma Facillit Hub.</p>
                        
                        {isAdmin && (
                            <div className="mt-8">
                                <Link href="/admin/updates" className="inline-block bg-white text-royal-blue py-2 px-5 rounded-md font-bold hover:bg-opacity-90 transition">
                                    <i className="fas fa-edit mr-2"></i> Gerenciar Atualizações
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-white dark:bg-dark-background">
                    <div className="container mx-auto px-6 max-w-4xl">
                        {error && <p className="text-red-500 text-center">Ocorreu um erro ao carregar as atualizações.</p>}
                        
                        {updates && updates.length > 0 ? (
                            <div className="space-y-12">
                                {Object.entries(groupedUpdates).map(([moduleSlug, updateList]) => (
                                    <UpdateGroup key={moduleSlug} moduleSlug={moduleSlug} updates={updateList} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-text-muted">Nenhuma atualização encontrada.</p>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
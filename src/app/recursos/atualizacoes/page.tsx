import Header from '@/components/Header';
import Footer from '@/components/Footer';
import createSupabaseServerClient from '@/utils/supabase/server';
// CORREÇÃO: Usando um caminho absoluto a partir da pasta 'src'
import UpdateItem from '@/app/admin/updates/components/UpdateItem';
import type { Update } from '@/app/dashboard/types';

export default async function AtualizacoesPage() {
    const supabase = await createSupabaseServerClient();
    const { data: updates, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Histórico de Atualizações</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">Acompanhe as últimas novidades, melhorias e correções da plataforma Facillit Hub.</p>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-white dark:bg-dark-background">
                    <div className="container mx-auto px-6 max-w-3xl">
                        {error && <p className="text-red-500 text-center">Ocorreu um erro ao carregar as atualizações.</p>}
                        
                        {updates && updates.length > 0 ? (
                            updates.map((update: Update) => (
                                <UpdateItem key={update.id} update={update} />
                            ))
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
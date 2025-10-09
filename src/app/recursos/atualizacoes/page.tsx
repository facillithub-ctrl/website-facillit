import Header from '@/components/Header';
import Footer from '@/components/Footer';
import createSupabaseServerClient from '@/utils/supabase/server';
import Link from 'next/link';
// CORREÇÃO: Usando importação nomeada com chaves
import { UpdatesClientPage } from '@/app/recursos/atualizacoes/components/UpdatesClientPage';
import type { Update } from '@/app/dashboard/types';

export default async function AtualizacoesPage() {
    const supabase = await createSupabaseServerClient();

    const { data: updates, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

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

                {error && <p className="text-red-500 text-center py-10">Ocorreu um erro ao carregar as atualizações.</p>}

                <UpdatesClientPage initialUpdates={updates || []} />

            </main>
            <Footer />
        </>
    );
}
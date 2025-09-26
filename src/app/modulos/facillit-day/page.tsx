import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitDayPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/day.png" alt="Logo Facillit Day" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Seu assistente pessoal inteligente que centraliza agenda, tarefas e hábitos para máxima produtividade.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Organize seu Dia, Conquiste seus Objetivos</h2>
                            <p className="text-text-muted mb-4">O Facillit Day é o organizador pessoal do ecossistema, projetado para ser seu assistente de produtividade e gestão de hábitos. Ele integra todas as áreas da sua vida em um só lugar.</p>
                            <p className="text-text-muted">Receba alertas sobre prazos de estudos do Facillit Edu, agende suas tarefas do Facillit Task e até receba sugestões de períodos de relaxamento com jogos do Facillit Games, tudo de forma inteligente e automática.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-sync-alt" title="Sincronização Total" text="Integração nativa com todos os módulos do ecossistema Facillit." />
                            <FeatureIcon icon="fa-bell" title="Alertas Inteligentes" text="Lembretes automáticos sobre prazos, provas e compromissos." />
                            <FeatureIcon icon="fa-flag-checkered" title="Gestão de Hábitos" text="Crie e acompanhe hábitos de estudo, saúde e bem-estar." />
                            <FeatureIcon icon="fa-tasks" title="Listas de Tarefas" text="Organize suas pendências diárias, semanais e mensais com facilidade." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Sua Vida, Organizada</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Visão do calendário semanal" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Painel de acompanhamento de hábitos" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Lista de tarefas do dia com integração" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Produtividade em Números</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="+30%" label="Aumento na produtividade dos usuários" />
                            <StatCard value="-2h" label="Tempo economizado por semana em média" />
                            <StatCard value="88%" label="dos usuários cumprem mais metas com o app" />
                            <StatCard value="5M+" label="Tarefas concluídas com sucesso" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que Nossos Usuários Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Finalmente consegui organizar minha rotina de estudos com a faculdade e o trabalho. O Facillit Day é meu cérebro digital." name="Mariana Viana" role="Universitária" />
                            <TestimonialCard quote="Ter tudo integrado é a melhor parte. Eu coloco uma prova no Facillit Edu e ela aparece na minha agenda do Day. Simplesmente genial." name="Pedro Henrique" role="Estudante do Ensino Médio" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
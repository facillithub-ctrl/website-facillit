import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import ContactCTA from '@/components/ContactCTA';

// Componente de Ícone de Recurso
const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => (
    <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-text-muted">{text}</p>
    </div>
);

// Componente de Estatística
const StatCard = ({ value, label }: { value: string, label: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-4xl font-extrabold text-royal-blue">{value}</p>
        <p className="text-text-muted mt-2">{label}</p>
    </div>
);

// Componente de Depoimento
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => (
    <div className="bg-white p-8 rounded-lg shadow-lg">
        <p className="testimonial-text">&quot;Este serviço é incrível!&quot;</p> 
        <div>
            <strong className="block font-bold text-dark-text">{name}</strong>
            <span className="text-sm text-text-muted">{role}</span>
        </div>
    </div>
);

export default function FacillitEduPage() {
    return (
        <>
            <Header />
            <main>
                {/* Seção Hero ATUALIZADA com imagem branca */}
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image 
                            src="/assets/images/marcas/edu.png" 
                            alt="Logo Facillit Edu" 
                            width={400}
                            height={100}
                            // --- CLASSE TAILWIND CSS PARA TORNAR A IMAGEM BRANCA ---
                            className="mb-6 brightness-0 invert" 
                            priority 
                        />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            A plataforma completa para gestão pedagógica e de alunos, alinhada às diretrizes da BNCC.
                        </p>
                    </div>
                </section>

                {/* Seção "Sobre o Módulo" */}
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Educação Inteligente e Integrada</h2>
                            <p className="text-text-muted mb-4">
                                O Facillit Edu é o coração do nosso ecossistema educacional. Ele centraliza a gestão de notas, a frequência dos alunos, o planejamento de aulas e a comunicação entre escola e família, tudo em um ambiente intuitivo e poderoso.
                            </p>
                            <p className="text-text-muted">
                                Com ferramentas alinhadas à Base Nacional Comum Curricular (BNCC), o módulo ajuda instituições a otimizarem seus processos e a focarem no que realmente importa: o desenvolvimento e o sucesso dos alunos.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-chart-bar" title="Análise de Desempenho" text="Relatórios detalhados sobre o progresso individual e da turma." />
                            <FeatureIcon icon="fa-bullhorn" title="Comunicação Direta" text="Canal de comunicação integrado para avisos e mensagens." />
                            <FeatureIcon icon="fa-calendar-alt" title="Agenda Inteligente" text="Prazos de atividades e provas sincronizados com o Facillit Day." />
                            <FeatureIcon icon="fa-book" title="Planejador de Aulas" text="Ferramentas para criar e compartilhar planos de aula com a equipe." />
                        </div>
                    </div>
                </section>

                {/* Seção de Imagens */}
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Conheça a Interface</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Dashboard do Aluno" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Painel do Professor" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Relatórios de Desempenho" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>

                {/* Seção de Dados e Estatísticas */}
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                         <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Resultados que Falam por Si</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="+20%" label="Aumento no engajamento dos alunos" />
                            <StatCard value="-15%" label="Redução no tempo de planejamento de aulas" />
                            <StatCard value="95%" label="de satisfação entre os coordenadores" />
                            <StatCard value="+300" label="Escolas parceiras em todo o Brasil" />
                        </div>
                    </div>
                </section>

                {/* Seção de Relatos */}
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Educadores Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                           <TestimonialCard 
                                quote="O Facillit Edu revolucionou nossa gestão pedagógica. A integração com os outros módulos é o grande diferencial."
                                name="Ana Costa"
                                role="Coordenadora Pedagógica"
                           />
                           <TestimonialCard 
                                quote="Meus alunos estão mais organizados e eu consigo acompanhar o desenvolvimento de cada um de forma muito mais precisa."
                                name="Marcos Lima"
                                role="Professor de História"
                           />
                        </div>
                    </div>
                </section>

                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
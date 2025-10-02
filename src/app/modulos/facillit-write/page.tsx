import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link'; // <-- ADICIONADO: Importação do componente Link
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitWritePage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/write.png" alt="Logo Facillit Write" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Produção textual com correção híbrida de Inteligência Artificial e tutores humanos para elevar sua escrita.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">A Ferramenta Definitiva para sua Redação</h2>
                            <p className="text-text-muted mb-4">O Facillit Write combina o melhor dos dois mundos: a velocidade da Inteligência Artificial para uma análise inicial de gramática e estrutura, e a profundidade de um tutor humano para um feedback qualitativo e estratégico.</p>
                            <p className="text-text-muted">Ideal para estudantes do Ensino Médio, vestibulandos e universitários, a plataforma organiza os temas por eixos temáticos, ajudando você a se preparar para os maiores desafios de escrita acadêmica.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-robot" title="Correção por IA" text="Análise instantânea de gramática, coesão e estrutura textual." />
                            <FeatureIcon icon="fa-user-graduate" title="Feedback Humano" text="Nossos tutores fornecem insights estratégicos para aprimorar seus argumentos." />
                            <FeatureIcon icon="fa-stream" title="Eixos Temáticos" text="Organize seus estudos com base nos temas mais recorrentes nos vestibulares." />
                            <FeatureIcon icon="fa-archive" title="Portfólio de Textos" text="Salve suas redações e acompanhe sua evolução ao longo do tempo." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Veja o Write em Ação</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/modulespervw/write/dashboard.jpeg" alt="Dashboard" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/modulespervw/write/tema.jpeg" alt="Temas" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/modulespervw/write/correção.jpeg" alt="Comentários do tutor humano" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Evolução Comprovada</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="+150" label="Pontos de aumento na média das redações" />
                            <StatCard value="9/10" label="Usuários relatam mais confiança na escrita" />
                            <StatCard value="2M+" label="Redações corrigidas pela plataforma" />
                            <StatCard value="< 24h" label="Tempo médio para feedback do tutor" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Vestibulandos Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="O feedback dos tutores foi o que me fez entender onde eu errava. A IA ajudava no básico, mas a análise humana foi essencial para minha aprovação!" name="Júlia Andrade" role="Aprovada em Medicina" />
                            <TestimonialCard quote="Consegui evoluir da nota 680 para 960 em seis meses usando o Facillit Write. Não tenho como agradecer." name="Ricardo Nobre" role="Estudante de Direito" />
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-3xl mx-auto bg-background-light p-8 rounded-lg">
                            <h3 className="text-2xl font-bold text-dark-text mb-4">Transparência em Primeiro Lugar</h3>
                            <p className="text-text-muted mb-6">
                                Queremos que você entenda exatamente como seus dados são utilizados para potenciar sua experiência de aprendizado neste módulo. Confira os detalhes sobre o tratamento de dados específico do Facillit Write.
                            </p>
                            <Link href="/recursos/politica-de-dado/page.tsx" className="inline-block bg-transparent text-royal-blue py-3 px-8 rounded-full font-bold border-2 border-royal-blue transition-all duration-300 hover:bg-royal-blue hover:text-white">
                                Confira a Política de Dados do Módulo
                            </Link>
                        </div>
                    </div>
                </section>

                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitTestPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/test.png" alt="Logo Facillit Test" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Crie e realize simulados, quizzes e provas personalizadas com análises de desempenho detalhadas.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Teste Seus Conhecimentos, Direcione Seus Estudos</h2>
                            <p className="text-text-muted mb-4">O Facillit Test é a ferramenta definitiva para avaliar seu aprendizado. Crie simulados personalizados, quizzes rápidos e provas completas a partir de um vasto banco de questões.</p>
                            <p className="text-text-muted">Após cada teste, receba uma análise de desempenho detalhada que aponta seus pontos fortes e fracos, permitindo que você guie seus estudos de forma muito mais inteligente e eficiente.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-question-circle" title="Banco de Questões" text="Milhares de questões de vestibulares e concursos." />
                            <FeatureIcon icon="fa-pencil-ruler" title="Testes Personalizados" text="Crie provas com as matérias e o tempo que você definir." />
                            <FeatureIcon icon="fa-chart-pie" title="Análise de Desempenho" text="Relatórios que mostram sua evolução e áreas para melhorar." />
                            <FeatureIcon icon="fa-sync" title="Integração de Conteúdo" text="Receba sugestões de videoaulas do Facillit Play com base em seus erros." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Prepare-se para o Sucesso</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Criação de um simulado personalizado" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Realizando uma prova online" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Gráfico de análise de desempenho por matéria" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Resultados Mensuráveis</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="+200" label="Pontos de melhoria na nota do ENEM" />
                            <StatCard value="500k+" label="Testes realizados na plataforma" />
                            <StatCard value="93%" label="dos usuários se sentem mais confiantes para as provas" />
                            <StatCard value="10k+" label="Questões disponíveis no banco de dados" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Aprovados Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Os simulados do Facillit Test foram idênticos ao nível da prova real. A análise de desempenho me mostrou exatamente onde focar na reta final." name="Isabela Rocha" role="Aprovada em Engenharia" />
                            <TestimonialCard quote="Fazer um quiz rápido todo dia depois de estudar a matéria ajudou a fixar o conteúdo de uma forma que eu não conseguia antes." name="Rodrigo Alves" role="Estudante de Cursinho" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
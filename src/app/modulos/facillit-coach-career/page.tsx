import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitCoachCareerPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/cec.png" alt="Logo Facillit Coach & Career" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Desenvolva soft skills e conecte-se a oportunidades de carreira com nossa orientação vocacional.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Planeje seu Futuro, Desenvolva seu Potencial</h2>
                            <p className="text-text-muted mb-4">O Facillit Coach & Career é seu guia para o sucesso pessoal e profissional. Focado no desenvolvimento de soft skills, o módulo ajuda você a definir metas claras, aumentar a produtividade e aprofundar o autoconhecimento.</p>
                            <p className="text-text-muted">Além disso, nossa plataforma de orientação vocacional oferece ferramentas para a elaboração de currículos de impacto e te conecta com as melhores oportunidades de estágios e empregos no mercado.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-lightbulb" title="Desenvolvimento de Skills" text="Trilhas de aprendizado para comunicação, liderança e mais." />
                            <FeatureIcon icon="fa-compass" title="Orientação Vocacional" text="Testes e análises para ajudar na escolha da sua carreira." />
                            <FeatureIcon icon="fa-file-signature" title="Construtor de Currículos" text="Crie currículos profissionais com modelos testados pelo mercado." />
                            <FeatureIcon icon="fa-briefcase" title="Portal de Vagas" text="Acesso a oportunidades de estágio e emprego em empresas parceiras." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Sua Carreira Decola Aqui</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Trilha de desenvolvimento de liderança" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Resultado de teste vocacional" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Portal de vagas de estágio" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Construindo Carreiras de Sucesso</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="10k+" label="Jovens conectados a vagas" />
                            <StatCard value="500+" label="Empresas parceiras" />
                            <StatCard value="90%" label="dos usuários se sentem mais preparados" />
                            <StatCard value="40+" label="Cursos de soft skills disponíveis" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Profissionais Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="A orientação vocacional foi um divisor de águas. Eu estava perdido, e a plataforma me ajudou a encontrar um caminho que realmente combina comigo." name="Felipe Costa" role="Estudante de Engenharia" />
                            <TestimonialCard quote="Consegui meu primeiro estágio através do portal de vagas. O construtor de currículos me ajudou a destacar minhas qualidades." name="Larissa Mendes" role="Jovem Aprendiz" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
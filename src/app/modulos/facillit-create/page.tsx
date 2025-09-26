import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitCreatePage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/create.png" alt="Logo Facillit Create" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Ferramentas online para criar mapas mentais, infográficos e apresentações, estimulando a criatividade.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Transforme Ideias em Materiais Visuais Incríveis</h2>
                            <p className="text-text-muted mb-4">O Facillit Create é seu estúdio de criação digital. Dê vida às suas ideias com um conjunto de ferramentas online para a criação de materiais visuais impactantes, como infográficos, mapas mentais e apresentações.</p>
                            <p className="text-text-muted">Perfeito para estudantes e profissionais que precisam organizar ideias, apresentar projetos ou simplesmente estimular a criatividade. Crie materiais visualmente atraentes com templates fáceis de usar.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-sitemap" title="Mapas Mentais" text="Organize ideias complexas de forma clara e intuitiva." />
                            <FeatureIcon icon="fa-chart-pie" title="Infográficos" text="Transforme dados e informações em visuais atraentes." />
                            <FeatureIcon icon="fa-desktop" title="Apresentações" text="Crie slides profissionais para suas aulas e reuniões." />
                            <FeatureIcon icon="fa-palette" title="Templates Prontos" text="Comece rapidamente com uma biblioteca de modelos personalizáveis." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Dê Vida às Suas Ideias</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Criação de um mapa mental" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Editor de infográficos" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Template de apresentação" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Criatividade em Números</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="1.5M+" label="Criações feitas na plataforma" />
                            <StatCard value="200+" label="Templates disponíveis" />
                            <StatCard value="96%" label="dos usuários relatam mais facilidade para organizar ideias" />
                            <StatCard value="4.9/5" label="Nota de satisfação dos usuários" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Criativos Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Os mapas mentais do Create me ajudaram a estruturar meu TCC. A visualização das ideias fez toda a diferença para organizar os capítulos." name="Vanessa Rios" role="Formanda em Publicidade" />
                            <TestimonialCard quote="Eu uso os templates de apresentação para minhas aulas. Meus alunos adoram o visual e eu economizo um tempo enorme." name="Prof. Ricardo Mendes" role="Professor de Geografia" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
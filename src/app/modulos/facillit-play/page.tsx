import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitPlayPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/play.png" alt="Logo Facillit Play" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Seu serviço de streaming focado em educação, com videoaulas, documentários e eventos ao vivo.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Conhecimento Sob Demanda</h2>
                            <p className="text-text-muted mb-4">O Facillit Play é a sua plataforma de streaming educacional. Tenha acesso a um catálogo completo de videoaulas, documentários, animações e assista a eventos ao vivo, como aulões e palestras.</p>
                            <p className="text-text-muted">Todo o conteúdo é cuidadosamente organizado por materiais, coleções e eixos temáticos, permitindo que você encontre exatamente o que precisa para aprofundar seus estudos ou explorar novos interesses.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-video" title="Vasto Catálogo" text="Milhares de horas de conteúdo educacional de alta qualidade." />
                            <FeatureIcon icon="fa-broadcast-tower" title="Eventos ao Vivo" text="Participe de aulões, workshops e palestras em tempo real." />
                            <FeatureIcon icon="fa-search" title="Busca Inteligente" text="Encontre conteúdo por matéria, tema ou habilidade específica." />
                            <FeatureIcon icon="fa-mobile-alt" title="Acesso Multiplataforma" text="Assista onde e quando quiser, no seu celular, tablet ou computador." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Navegue pelo Conteúdo</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Tela inicial do streaming" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Player de videoaula" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Catálogo de documentários" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Aprendizado que Engaja</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="5000+" label="Videoaulas disponíveis" />
                            <StatCard value="200+" label="Documentários e curtas" />
                            <StatCard value="100k" label="Usuários ativos mensais" />
                            <StatCard value="4.9/5" label="Nota de satisfação dos usuários" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Estudantes Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="As aulas do Facillit Play são muito mais dinâmicas do que as que eu via no YouTube. Os professores são ótimos e o conteúdo é direto ao ponto." name="Beatriz Lins" role="Vestibulanda" />
                            <TestimonialCard quote="Uso os documentários para complementar meus estudos na faculdade. A qualidade da produção é incrível e sempre aprendo algo novo." name="Carlos Eduardo" role="Estudante de História" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
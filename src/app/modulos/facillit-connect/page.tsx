import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitConnectPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/connect.png" alt="Logo Facillit Connect" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">A rede social educacional para criar comunidades de estudo e conectar alunos e professores.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Conecte-se ao Conhecimento</h2>
                            <p className="text-text-muted mb-4">O Facillit Connect é o ponto de encontro da nossa comunidade. Uma rede social projetada para o ambiente educacional, onde alunos podem criar grupos de estudo, professores podem compartilhar materiais e todos podem se conectar para organizar eventos acadêmicos e produtivos.</p>
                            <p className="text-text-muted">Fomente a colaboração, tire dúvidas com colegas, encontre mentores e participe de discussões que enriquecem sua jornada de aprendizado em um ambiente seguro e focado.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-users" title="Comunidades de Estudo" text="Crie ou participe de grupos focados em matérias e interesses." />
                            <FeatureIcon icon="fa-comments" title="Fóruns de Discussão" text="Tire dúvidas e debata sobre temas acadêmicos com colegas e especialistas." />
                            <FeatureIcon icon="fa-calendar-plus" title="Organização de Eventos" text="Crie e divulgue eventos, como aulões, palestras e grupos de estudo." />
                            <FeatureIcon icon="fa-project-diagram" title="Networking Acadêmico" text="Conecte-se com professores, mentores e outros estudantes da sua área." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Um Espaço para Colaborar</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Feed de notícias da comunidade" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Página de um grupo de estudo de Biologia" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Criação de um novo evento acadêmico" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Nossa Comunidade em Números</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="200k+" label="Membros ativos" />
                            <StatCard value="5k+" label="Grupos de estudo criados" />
                            <StatCard value="1.5k" label="Eventos organizados por mês" />
                            <StatCard value="97%" label="dos membros recomendam a plataforma" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que a Comunidade Diz</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Encontrei meu grupo de estudos para o vestibular no Connect e foi a melhor coisa que fiz. A gente se ajuda muito e o ambiente é super focado." name="Gabriela Dias" role="Vestibulanda de Arquitetura" />
                            <TestimonialCard quote="Como professor, uso o Connect para compartilhar materiais extras e tirar dúvidas fora do horário de aula. A interação com os alunos melhorou demais." name="Prof. André Neves" role="Professor de Física" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
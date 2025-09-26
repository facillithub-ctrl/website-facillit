import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitTaskPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/task.png" alt="Logo Facillit Task" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Uma plataforma de gestão de tarefas que vai além dos estudos, para organizar toda a sua vida.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Organize Mais do que Apenas os Estudos</h2>
                            <p className="text-text-muted mb-4">A vida é feita de múltiplas responsabilidades. O Facillit Task é a ferramenta flexível que você precisa para gerenciar todas elas. Crie projetos, defina prazos e acompanhe o progresso de tarefas pessoais e profissionais.</p>
                            <p className="text-text-muted">De rotinas de treino e alimentação a cuidados com seus pets e projetos pessoais, o Facillit Task oferece a estrutura para que nada fique para trás, tudo sincronizado com sua agenda no Facillit Day.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-running" title="Metas de Treino" text="Organize sua rotina de exercícios e acompanhe sua evolução." />
                            <FeatureIcon icon="fa-utensils" title="Plano Alimentar" text="Planeje suas refeições e crie listas de compras inteligentes." />
                            <FeatureIcon icon="fa-paw" title="Cuidados com Pets" text="Agende vacinas, banhos e outras necessidades do seu animal de estimação." />
                            <FeatureIcon icon="fa-clipboard-list" title="Projetos Pessoais" text="Divida grandes objetivos em pequenas tarefas gerenciáveis." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Sua Vida em Foco</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Painel de projetos pessoais" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Lista de tarefas para a rotina fitness" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Agenda de cuidados com o pet" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Organização que Gera Resultados</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="10M+" label="Tarefas criadas" />
                            <StatCard value="99%" label="de precisão na sincronização com o Facillit Day" />
                            <StatCard value="75%" label="dos usuários gerenciam tarefas não-escolares no app" />
                            <StatCard value="4.8/5" label="Nota de satisfação pela flexibilidade" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Usuários Multitarefa Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Eu uso o Task para tudo: desde a lista do supermercado até o cronograma de postagens do meu blog. É a ferramenta mais versátil que já encontrei." name="Laura Pinheiro" role="Criadora de Conteúdo" />
                            <TestimonialCard quote="Consigo gerenciar os treinos da minha assessoria esportiva e meus próprios estudos em um só lugar. A integração entre Task e Day é perfeita." name="Diego Martins" role="Atleta e Estudante" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
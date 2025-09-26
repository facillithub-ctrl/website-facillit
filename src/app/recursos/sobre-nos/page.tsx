import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

const ValueCard = ({ icon, title, text }: { icon: string, title: string, text: string }) => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-royal-blue text-4xl mb-4"><i className={`fas ${icon}`}></i></div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-text-muted">{text}</p>
    </div>
);

const TeamMember = ({ name, role, img }: { name: string, role: string, img: string }) => (
    <div className="text-center">
        <Image src={img} alt={name} width={128} height={128} className="rounded-full mx-auto mb-4" />
        <h4 className="font-bold text-lg">{name}</h4>
        <p className="text-text-muted">{role}</p>
    </div>
);

export default function SobreNosPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Nossa Missão é Simplificar e Potencializar a Sua Jornada Digital</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">Conheça a história e os valores que movem o Facillit Hub a transformar ideias em resultados reais.</p>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">O Ecossistema Integrado</h2>
                            <p className="text-text-muted mb-4">O Facillit Hub foi concebido para ser mais do que um simples conjunto de aplicativos; ele se posiciona como um ecossistema digital inteligente e integrado. Sua proposta fundamental é centralizar e unificar as diversas facetas da vida digital, oferecendo uma solução coesa para os desafios de organização, produtividade e educação.</p>
                            <p className="text-text-muted">O foco não está nos módulos individuais, mas na sinergia criada pela sua interconexão, transformando dados em insights práticos que ajudam o usuário a alcançar seus objetivos de forma mais eficaz.</p>
                        </div>
                        <div className="flex justify-center">
                           <Image src="/assets/images/LOGO/png/isologo.png" alt="Ecossistema Facillit Hub" width={400} height={400} />
                        </div>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Nossos Valores</h2>
                        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <ValueCard icon="fa-link" title="Conexão" text="Conectamos pessoas, ideias e ferramentas para gerar uma sinergia que proporciona uma visão holística e integrada." />
                            <ValueCard icon="fa-lightbulb" title="Inovação" text="Estamos atentos às tendências pedagógicas e tecnológicas para oferecer soluções que sejam genuinamente relevantes." />
                            <ValueCard icon="fa-universal-access" title="Acessibilidade" text="Garantimos que a plataforma seja fácil de usar e buscamos democratizar o acesso a ferramentas de alta qualidade." />
                        </div>
                    </div>
                </section>
                
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Nossa Equipe</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                           <TeamMember name="Carlos Silva" role="CEO & Fundador" img="https://i.pravatar.cc/150?img=1" />
                           <TeamMember name="Ana Oliveira" role="CTO" img="https://i.pravatar.cc/150?img=2" />
                           <TeamMember name="Pedro Martins" role="Head de Produto" img="https://i.pravatar.cc/150?img=3" />
                           <TeamMember name="Juliana Costa" role="Head de Design" img="https://i.pravatar.cc/150?img=4" />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
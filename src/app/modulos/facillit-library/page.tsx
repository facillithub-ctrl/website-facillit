import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitLibraryPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/library.png" alt="Logo Facillit Library" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Sua biblioteca digital e plataforma para escrita criativa e construção de portfólios profissionais.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Onde o Conhecimento e a Criatividade se Encontram</h2>
                            <p className="text-text-muted mb-4">A Facillit Library é mais do que uma simples biblioteca digital. É um espaço para expandir seus horizontes com um vasto acervo de livros e artigos, e também uma poderosa ferramenta para dar vida às suas próprias ideias.</p>
                            <p className="text-text-muted">Utilize a plataforma para escrita criativa, armazene suas redações do Facillit Write e construa portfólios digitais impressionantes para apresentar seus trabalhos e projetos acadêmicos ou profissionais.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-atlas" title="Vasto Acervo" text="Acesse milhares de livros, artigos e publicações acadêmicas." />
                            <FeatureIcon icon="fa-paint-brush" title="Escrita Criativa" text="Ferramentas dedicadas para desenvolver suas habilidades de escrita." />
                            <FeatureIcon icon="fa-file-invoice" title="Portfólios Digitais" text="Crie e compartilhe portfólios elegantes para seus projetos." />
                            <FeatureIcon icon="fa-cloud-upload-alt" title="Armazenamento Centralizado" text="Guarde seus textos do Facillit Write e outros documentos." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Sua Estante Virtual</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Visualização da biblioteca digital" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Ferramenta de criação de portfólio" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Exemplo de portfólio publicado" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Conhecimento Acessível</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="10k+" label="Livros e artigos no acervo" />
                            <StatCard value="50k" label="Portfólios criados por usuários" />
                            <StatCard value="30%" label="Aumento na frequência de leitura dos usuários" />
                            <StatCard value="1M+" label="Documentos armazenados na plataforma" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Criadores Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Montei meu portfólio de design na Facillit Library e consegui meu primeiro estágio. A plataforma é super fácil de usar e o resultado fica muito profissional." name="Amanda Gomes" role="Estudante de Design Gráfico" />
                            <TestimonialCard quote="Ter acesso a tantos artigos científicos em um só lugar facilitou demais minha pesquisa de mestrado. É uma ferramenta indispensável." name="Bruno Ferreira" role="Mestrando em Biologia" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
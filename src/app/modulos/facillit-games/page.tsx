import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitGamesPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/games.png" alt="Logo Facillit Games" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Inovação pedagógica através da gamificação adaptativa, onde aprender se torna uma aventura.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Aprender Nunca Foi Tão Divertido</h2>
                            <p className="text-text-muted mb-4">O Facillit Games transforma o estudo em uma experiência envolvente e eficaz. Com jogos educativos que se ajustam à performance do jogador, garantimos que o desafio esteja sempre no nível certo para estimular o aprendizado sem causar frustração.</p>
                            <p className="text-text-muted">Nossa vasta biblioteca de jogos é organizada por matéria e habilidade, como lógica, matemática e interpretação, utilizando um sistema de pontos e medalhas para manter o engajamento e a motivação em alta.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-brain" title="Aprendizagem Adaptativa" text="A dificuldade dos jogos se ajusta automaticamente ao seu ritmo." />
                            <FeatureIcon icon="fa-trophy" title="Sistema de Recompensas" text="Ganhe pontos e medalhas para celebrar suas conquistas." />
                            <FeatureIcon icon="fa-book-reader" title="Conteúdo Alinhado" text="Jogos separados por matérias e coleções temáticas relevantes." />
                            <FeatureIcon icon="fa-chart-line" title="Desenvolvimento de Skills" text="Aprimore habilidades como lógica, matemática e raciocínio rápido." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Explore o Universo dos Games</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Tela de seleção de jogos" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Exemplo de minigame de matemática" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Tela de conquistas e medalhas" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Impacto no Aprendizado</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="+40%" label="Melhora na retenção de conteúdo" />
                            <StatCard value="+25%" label="Aumento na velocidade de resolução de problemas" />
                            <StatCard value="10M+" label="Partidas jogadas em 2024" />
                            <StatCard value="98%" label="dos alunos afirmam aprender mais com jogos" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Alunos Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Eu nem percebo que estou estudando. Os jogos são viciantes e eu realmente sinto que estou aprendendo mais rápido." name="Lucas Martins" role="Aluno do 9º Ano" />
                            <TestimonialCard quote="Usar o Facillit Games em sala de aula mudou a dinâmica com meus alunos. Eles estão mais participativos e motivados." name="Fernanda Souza" role="Professora de Ciências" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
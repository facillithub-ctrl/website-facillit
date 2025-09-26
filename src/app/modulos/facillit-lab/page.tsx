import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => ( <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"><div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-text-muted">{text}</p></div> );
const StatCard = ({ value, label }: { value: string, label: string }) => ( <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-extrabold text-royal-blue">{value}</p><p className="text-text-muted mt-2">{label}</p></div> );
const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => ( <div className="bg-white p-8 rounded-lg shadow-lg"><p className="testimonial-text text-text-muted italic mb-4">{`"${quote}"`}</p><div><strong className="block font-bold text-dark-text">{name}</strong><span className="text-sm text-text-muted">{role}</span></div></div> );

export default function FacillitLabPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 flex flex-col items-center">
                        <Image src="/assets/images/marcas/lab.png" alt="Logo Facillit Lab" width={400} height={100} className="mb-6 brightness-0 invert" priority />
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">Laboratório virtual com simulações e experimentos 3D para o aprendizado prático de STEM.</p>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">A Ciência na Ponta dos Seus Dedos</h2>
                            <p className="text-text-muted mb-4">O Facillit Lab leva o laboratório para onde você estiver. Explore conceitos complexos de Ciência, Tecnologia, Engenharia e Matemática (STEM) através de simulações interativas, experimentos virtuais e ambientes 3D imersivos.</p>
                            <p className="text-text-muted">Aprenda na prática, sem riscos e com recursos ilimitados. Nossos recursos são organizados por materiais e eixos temáticos para complementar perfeitamente o conteúdo visto em sala de aula.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-atom" title="Simulações Interativas" text="Manipule variáveis e veja reações químicas e físicas em tempo real." />
                            <FeatureIcon icon="fa-vr-cardboard" title="Ambientes 3D" text="Explore modelos do corpo humano, sistema solar e muito mais." />
                            <FeatureIcon icon="fa-microscope" title="Experimentos Seguros" text="Realize experimentos complexos sem a necessidade de um laboratório físico." />
                            <FeatureIcon icon="fa-book-dead" title="Conteúdo Curricular" text="Recursos alinhados aos principais currículos de STEM." />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Experimente o Futuro</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Image src="/assets/images/placeholder-module.png" alt="Simulação de uma reação química" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Modelo 3D interativo do coração humano" width={500} height={300} className="rounded-lg shadow-lg" />
                            <Image src="/assets/images/placeholder-module.png" alt="Laboratório virtual de física" width={500} height={300} className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Ciência Comprovada</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="200+" label="Simulações disponíveis" />
                            <StatCard value="35%" label="Melhora na compreensão de conceitos abstratos" />
                            <StatCard value="100%" label="Ambiente seguro e livre de acidentes" />
                            <StatCard value="50k" label="Experimentos realizados por mês" />
                        </div>
                    </div>
                </section>
                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">O que os Cientistas do Futuro Dizem</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Eu sempre tive dificuldade em visualizar as moléculas em química. Com o Lab 3D, tudo ficou mais claro. É como ter um laboratório em casa." name="Clara Borges" role="Aluna do Ensino Médio" />
                            <TestimonialCard quote="As simulações de física me ajudaram a passar no vestibular. Poder testar as leis de Newton na prática fez toda a diferença." name="Rafael Pires" role="Estudante de Física" />
                        </div>
                    </div>
                </section>
                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const BenefitCard = ({ icon, title, text }: { icon: string, title: string, text: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-text-muted">{text}</p>
    </div>
);

const JobOpening = ({ title, department, location }: { title: string, department: string, location: string }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex justify-between items-center">
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-text-muted text-sm">{department} • {location}</p>
        </div>
        <Link href="#" className="bg-royal-blue text-white py-2 px-5 rounded-md font-bold hover:bg-opacity-90 transition">Ver Vaga</Link>
    </div>
);

export default function CarreirasPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Faça Parte da Nossa Missão</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">Estamos buscando pessoas talentosas e apaixonadas por tecnologia e educação para nos ajudar a construir o futuro.</p>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Por que trabalhar no Facillit Hub?</h2>
                        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <BenefitCard icon="fa-rocket" title="Inovação Constante" text="Trabalhe com tecnologias de ponta e em um ambiente que incentiva a criatividade e a experimentação." />
                            <BenefitCard icon="fa-chart-line" title="Crescimento Profissional" text="Oferecemos planos de carreira, treinamentos e oportunidades para você evoluir junto com a empresa." />
                            <BenefitCard icon="fa-heart" title="Impacto Real" text="Ajude a transformar a vida de milhares de estudantes e profissionais com as soluções que você irá construir." />
                        </div>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">Vagas em Aberto</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-dark-text mb-4">Engenharia</h3>
                                <div className="space-y-4">
                                    <JobOpening title="Engenheiro(a) de Software Pleno (Frontend)" department="Engenharia" location="Remoto" />
                                    <JobOpening title="Engenheiro(a) de Software Sênior (Backend)" department="Engenharia" location="Remoto" />
                                </div>
                            </div>
                             <div>
                                <h3 className="text-2xl font-bold text-dark-text mb-4">Design</h3>
                                <div className="space-y-4">
                                    <JobOpening title="UX/UI Designer Pleno" department="Design" location="Híbrido - São Paulo, SP" />
                                </div>
                            </div>
                             <div>
                                <h3 className="text-2xl font-bold text-dark-text mb-4">Marketing</h3>
                                <div className="space-y-4">
                                    <JobOpening title="Analista de Marketing Digital" department="Marketing" location="Híbrido - São Paulo, SP" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
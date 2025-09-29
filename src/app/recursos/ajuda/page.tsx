import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Faq from '@/components/Faq';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget'; // Importaremos o novo componente

const TutorialCard = ({ icon, title, text }: { icon: string, title: string, text: string }) => (
    <Link href="#" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="text-royal-blue text-3xl mb-4"><i className={`fas ${icon}`}></i></div>
        <h3 className="text-xl font-bold mb-2 text-dark-text">{title}</h3>
        <p className="text-text-muted">{text}</p>
    </Link>
);

const UpdateItem = ({ date, title, text }: { date: string, title: string, text: string }) => (
    <div className="relative pl-8 pb-8 border-l-2 border-gray-200">
        <div className="absolute -left-[11px] top-1 w-5 h-5 bg-royal-blue rounded-full"></div>
        <p className="text-sm text-text-muted mb-1">{date}</p>
        <h4 className="font-bold text-dark-text">{title}</h4>
        <p className="text-text-muted">{text}</p>
    </div>
);


export default function CentralDeAjudaPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Central de Ajuda</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">Como podemos ajudar? Encontre respostas, tutoriais e as últimas novidades da plataforma.</p>
                        <div className="mt-8 max-w-2xl mx-auto">
                            <div className="relative">
                                <input type="search" placeholder="Pesquise por um tópico ou pergunta..." className="w-full p-4 rounded-lg text-dark-text" />
                                <i className="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-background-light">
                    <div className="container mx-auto px-6">
                         <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12 text-center">Tutoriais</h2>
                         <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
                            <TutorialCard icon="fa-rocket" title="Primeiros Passos" text="Aprenda a configurar sua conta e personalizar seu dashboard." />
                            <TutorialCard icon="fa-pencil-alt" title="Usando o Facillit Write" text="Veja como enviar uma redação e interpretar os feedbacks." />
                            <TutorialCard icon="fa-calendar-check" title="Organizando seu Dia" text="Descubra as melhores práticas para usar o Facillit Day." />
                         </div>
                    </div>
                </section>

                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2">
                             <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Últimas Atualizações</h2>
                             <div className="">
                                <UpdateItem date="20/09/2025" title="Correção" text="Realizamos a correção de bugs, além de melhorias na performance do site e no reforço da segurança, para garantir uma experiência cada vez mais estável e confiável." />
                                <UpdateItem date="28/09/2025" title="Melhorias no Facillit Write" text="Foram implementadas as funções de correção, feedback e melhoria no envio das redações." />
                                <UpdateItem date="18/08/2025" title="Inauguração" text="O site está oficalmente no ar." />
                             </div>
                        </div>
                        <div>
                             <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Fale Conosco</h2>
                             <div className="bg-background-light p-8 rounded-lg">
                                <h4 className="font-bold text-xl mb-2">Não encontrou o que procurava?</h4>
                                <p className="text-text-muted mb-4">Nossa equipe de suporte está pronta para ajudar. Entre em contato conosco.</p>
                                <Link href="/recursos/contato" className="inline-block bg-royal-blue text-white py-3 px-6 rounded-lg font-bold">Ir para Contato</Link>
                             </div>
                        </div>
                    </div>
                </section>

                {/* A seção de FAQ existente */}
                <Faq />
                <ChatWidget />
            </main>
            <Footer />
        </>
    );
}
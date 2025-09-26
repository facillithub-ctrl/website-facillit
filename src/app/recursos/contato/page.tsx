import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactCTA from '@/components/ContactCTA';

export default function ContatoPage() {
    return (
        <>
            <Header />
            <main>
                 <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Fale Conosco</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">Tem alguma dúvida, sugestão ou proposta? Adoraríamos ouvir você.</p>
                    </div>
                </section>
                
                {/* Reutilizando o componente ContactCTA que já existe */}
                <ContactCTA />

                <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-6 text-center max-w-4xl">
                         <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">Outras Formas de Contato</h2>
                         <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <i className="fas fa-envelope text-4xl text-royal-blue mb-4"></i>
                                <h4 className="font-bold text-lg">E-mail</h4>
                                <p className="text-text-muted">Nosso canal principal para suporte.</p>
                                <a href="mailto:suporte@facillithub.com" className="text-royal-blue font-bold">suporte@facillithub.com</a>
                            </div>
                            <div className="text-center">
                                <i className="fas fa-phone-alt text-4xl text-royal-blue mb-4"></i>
                                <h4 className="font-bold text-lg">Telefone</h4>
                                <p className="text-text-muted">Para assuntos urgentes.</p>
                                <p className="font-bold">(11) 99999-8888</p>
                            </div>
                             <div className="text-center">
                                <i className="fas fa-map-marker-alt text-4xl text-royal-blue mb-4"></i>
                                <h4 className="font-bold text-lg">Endereço</h4>
                                <p className="text-text-muted">Nosso escritório principal.</p>
                                <p className="font-bold">Av. Paulista, 1000, São Paulo/SP</p>
                            </div>
                         </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
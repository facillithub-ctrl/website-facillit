import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Modules from '@/components/Modules';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';
// Importe outros componentes que você criar aqui

export default function Home() {
  return (
    <>
      <Header />
      <main id="fullpage-container">
        <Hero />
        <Modules />
        <Faq />
        {/* Adicione os outros componentes da página aqui */}
      </main>
      <Footer />
    </>
  );
}
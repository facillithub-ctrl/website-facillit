import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features'; // Adicionado
import Modules from '@/components/Modules';
import Testimonials from '@/components/Testimonials'; // Adicionado
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main id="fullpage-container">
        <Hero />
        <Features /> {/* Adicionado */}
        <Modules />
        <Testimonials /> {/* Adicionado */}
        <Faq />
      </main>
      <Footer />
    </>
  );
}
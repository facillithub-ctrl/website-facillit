import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-text text-white pt-20 pb-8" id="footer-section">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Pronto para transformar sua rotina?</h2>
          <p className="text-gray-400 mb-8">Comece a usar o Facillit Hub hoje mesmo e descubra um novo jeito de aprender, organizar e evoluir.</p>
          <Link href="/register" className="inline-block bg-royal-blue text-white py-4 px-10 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-105">CRIAR CONTA GRATUITA</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-left py-10 border-y border-gray-700">
          <div className="col-span-2 sm:col-span-3 md:col-span-1 flex justify-center md:justify-start mb-8 md:mb-0">
             <Image src="/assets/images/LOGO/png/isologo.png" alt="Facillit Hub Isologo" width={200} height={200} />
          </div>
          <div>
            <h5 className="font-bold text-gray-400 uppercase tracking-wider text-sm mb-4">Módulos populares</h5>
            <ul className="space-y-3">
              <li><Link href="/modulos/facillit-edu" className="text-gray-300 hover:text-white transition-colors">Facillit Edu</Link></li>
              <li><Link href="/modulos/facillit-games" className="text-gray-300 hover:text-white transition-colors">Facillit Games</Link></li>
              <li><Link href="/modulos/facillit-write" className="text-gray-300 hover:text-white transition-colors">Facillit Write</Link></li>
              <li><Link href="/modulos/facillit-day" className="text-gray-300 hover:text-white transition-colors">Facillit Day</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-gray-400 uppercase tracking-wider text-sm mb-4">Soluções</h5>
            <ul className="space-y-3">
               <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Para Pessoas</Link></li>
               <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Para Escolas</Link></li>
               <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Para Empresas</Link></li>
            </ul>
          </div>
           <div>
            <h5 className="font-bold text-gray-400 uppercase tracking-wider text-sm mb-4">Empresa</h5>
            <ul className="space-y-3">
               <li><Link href="/recursos/sobre-nos" className="text-gray-300 hover:text-white transition-colors">Sobre Nós</Link></li>
               <li><Link href="/recursos/carreiras" className="text-gray-300 hover:text-white transition-colors">Carreiras</Link></li>
               <li><Link href="/recursos/contato" className="text-gray-300 hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>
           <div>
            <h5 className="font-bold text-gray-400 uppercase tracking-wider text-sm mb-4">Recursos</h5>
            <ul className="space-y-3">
               <li><Link href="/recursos/uso" className="text-gray-300 hover:text-white transition-colors">Termos de Uso</Link></li>
               <li><Link href="/recursos/ajuda" className="text-gray-300 hover:text-white transition-colors">Central de Ajuda</Link></li>
               <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Facillit Hub. Todos os direitos reservados.</p>
          <div className="flex gap-5 mt-4 md:mt-0 text-xl">
            <a href="#" aria-label="Facebook" className="hover:text-white transition-colors"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
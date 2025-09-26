import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background-dark text-white py-12" id="footer-section">
      <div className="container mx-auto px-6 text-center">
        
        {/* Seção CTA */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Pronto para transformar sua rotina?</h2>
          <p className="text-gray-400 mb-8">Comece a usar o Facillit Hub hoje mesmo e descubra um novo jeito de aprender, organizar e evoluir.</p>
          <Link href="/register" className="inline-block bg-royal-blue text-white py-4 px-10 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-105">
            CRIAR CONTA GRATUITA
          </Link>
        </div>

        {/* Grid de Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-left py-10 border-y border-gray-700">
          <div className="col-span-2 md:col-span-1 flex justify-center md:justify-start">
             <Image src="/assets/images/LOGO/png/isologo.png" alt="Facillit Hub Isologo" width={120} height={120} />
          </div>
          {/* Coluna Módulos */}
          <div>
            <h5 className="font-bold text-gray-500 uppercase tracking-wider mb-4">Módulos</h5>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-400 hover:text-white">Facillit Edu</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Facillit Games</Link></li>
            </ul>
          </div>
          {/* Coluna Soluções */}
          <div>
            <h5 className="font-bold text-gray-500 uppercase tracking-wider mb-4">Soluções</h5>
            <ul className="space-y-3">
               <li><Link href="#" className="text-gray-400 hover:text-white">Para Pessoas</Link></li>
               <li><Link href="#" className="text-gray-400 hover:text-white">Para Escolas</Link></li>
            </ul>
          </div>
           {/* Adicione as outras colunas de links aqui */}
           <div>
            <h5 className="font-bold text-gray-500 uppercase tracking-wider mb-4">Empresa</h5>
            <ul className="space-y-3">
               <li><Link href="#" className="text-gray-400 hover:text-white">Sobre Nós</Link></li>
               <li><Link href="#" className="text-gray-400 hover:text-white">Contato</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Facillit Hub. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0 text-lg">
            <a href="#" aria-label="Facebook" className="hover:text-white"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram" className="hover:text-white"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background-light dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Image
          src="/assets/images/MASCOTE/nofound.png"  
          alt="Mascote Facillit Hub"
          width={250}
          height={250}
          className="mx-auto mb-8"
        />
        <h1 className="text-5xl font-black text-royal-blue mb-4">
          Oops!
        </h1>
        <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-2">
          Página Não Encontrada
        </h2>
        <p className="text-text-muted dark:text-gray-400 mb-8">
          Estamos trabalhando para ajustar isso. A página que você está procurando pode ter sido removida ou nunca existiu.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-royal-blue text-white py-3 px-8 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-105"
        >
          Voltar para a Tela de Início
        </Link>
      </div>
    </div>
  );
}
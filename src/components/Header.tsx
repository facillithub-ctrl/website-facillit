"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    document.body.classList.toggle('noscroll', isMenuOpen);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const headerClass = isScrolled
    ? "bg-white/95 shadow-md backdrop-blur-sm border-b border-gray-200"
    : "bg-transparent";
  
  const linkColor = isScrolled ? "text-dark-text" : "text-white";
  const logoFilter = isScrolled ? "" : "brightness-0 invert";
  const buttonClass = isScrolled ? "bg-royal-blue text-white" : "bg-white text-royal-blue";

  return (
    <header className={`fixed top-0 md:top-5 left-1/2 -translate-x-1/2 z-50 w-full md:w-[95%] md:max-w-[1400px] md:rounded-full transition-all duration-300 ${headerClass}`}>
      <div className="container mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={30} height={30} className={`transition-all duration-300 ${logoFilter}`} />
        </Link>
        
        {/* Navegação Desktop */}
        <nav className="hidden lg:flex items-center gap-8 mx-auto">
          <Link href="#hero" className={`font-bold transition-colors ${linkColor}`}>Início</Link>
          <Link href="#features" className={`font-bold transition-colors ${linkColor}`}>Diferenciais</Link>
          
          {/* Megadropdown Módulos */}
          <div className="group relative">
            <button className={`font-bold flex items-center gap-1 transition-colors ${linkColor}`}>
              Módulos <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="bg-white rounded-lg shadow-xl p-8 grid grid-cols-4 gap-8 min-w-[900px] text-left">
                {/* Coluna 1 */}
                <div className="dropdown-column">
                  <h5 className="font-bold text-dark-text mb-4 flex items-center gap-2"><i className="fas fa-graduation-cap text-royal-blue"></i> Estudo & Foco</h5>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-sm text-text-muted hover:text-royal-blue"><strong>Facillit Edu</strong><span className="block text-xs">Gestão pedagógica</span></Link></li>
                    <li><Link href="#" className="text-sm text-text-muted hover:text-royal-blue"><strong>Facillit Write</strong><span className="block text-xs">Escrita com IA</span></Link></li>
                  </ul>
                </div>
                 {/* Adicione outras colunas aqui */}
              </div>
            </div>
          </div>
          
           {/* Adicione outros links e dropdowns aqui */}
        </nav>

        {/* Botões da Direita */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className={`font-bold transition-colors ${linkColor}`}>Acessar</Link>
          <Link href="/register" className={`py-2 px-5 rounded-md font-bold transition-all duration-300 ${buttonClass}`}>Criar conta</Link>
        </div>

        {/* Botão Hamburger (Mobile) */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!isMenuOpen)} className={`text-2xl ${linkColor}`}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
      {/* Menu Mobile (Adicionar lógica depois) */}
    </header>
  );
}
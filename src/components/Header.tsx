"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Componente para um item do megadropdown
const DropdownItem = ({ href, title, subtitle }: { href: string; title: string; subtitle: string; }) => (
  <li>
    <Link href={href} className="flex flex-col p-2 rounded-lg hover:bg-gray-100">
      <strong className="text-sm font-bold text-dark-text">{title}</strong>
      <span className="text-xs text-text-muted">{subtitle}</span>
    </Link>
  </li>
);

// Componente para uma coluna do megadropdown
const DropdownColumn = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode; }) => (
  <div>
    <h5 className="mb-4 flex items-center gap-2 text-base font-bold text-dark-text">
      <i className={`fas ${icon} text-royal-blue`}></i> {title}
    </h5>
    <ul className="space-y-2">{children}</ul>
  </div>
);

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Checa o estado inicial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('noscroll', isMenuOpen);
  }, [isMenuOpen]);

  // Classes dinâmicas
  const headerClass = isScrolled ? "bg-white/95 shadow-md backdrop-blur-sm border-b border-gray-200" : "bg-transparent";
  const linkColor = isScrolled ? "text-dark-text" : "text-white";
  const logoFilter = isScrolled ? "" : "brightness-0 invert";
  const buttonClass = isScrolled ? "bg-royal-blue text-white" : "bg-white text-royal-blue";

  return (
    <>
      <header className={`fixed top-0 md:top-5 left-1/2 -translate-x-1/2 z-50 w-full md:w-[95%] md:max-w-[1400px] md:rounded-full transition-all duration-300 ${headerClass}`}>
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          <Link href="/" className="flex-shrink-0">
            <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={30} height={30} className={`transition-all duration-300 ${logoFilter}`} />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 mx-auto">
            <Link href="#hero" className={`font-bold transition-colors hover:opacity-80 ${linkColor}`}>Início</Link>
            <Link href="#features" className={`font-bold transition-colors hover:opacity-80 ${linkColor}`}>Diferenciais</Link>

            {/* Megadropdown Módulos */}
            <div className="group relative">
              <button className={`font-bold flex items-center gap-1 transition-colors ${linkColor}`}>
                Módulos <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white rounded-xl shadow-xl p-8 grid grid-cols-4 gap-x-10 gap-y-6 min-w-[950px] text-left">
                  <DropdownColumn icon="fa-graduation-cap" title="Estudo & Foco">
                    <DropdownItem href="#" title="Facillit Edu" subtitle="Gestão pedagógica e de alunos." />
                    <DropdownItem href="#" title="Facillit Write" subtitle="Escrita com correção de IA." />
                    <DropdownItem href="#" title="Facillit Test" subtitle="Criação de simulados e provas." />
                    <DropdownItem href="#" title="Facillit Lab" subtitle="Laboratório virtual com simulações." />
                  </DropdownColumn>
                  <DropdownColumn icon="fa-calendar-check" title="Organização Pessoal">
                    <DropdownItem href="#" title="Facillit Day" subtitle="Agenda, tarefas, finanças e hábitos." />
                    <DropdownItem href="#" title="Facillit Task" subtitle="Gestão de tarefas além dos estudos." />
                    <DropdownItem href="#" title="Facillit Finances" subtitle="Central de gestão financeira." />
                  </DropdownColumn>
                  <DropdownColumn icon="fa-briefcase" title="Carreira & Skills">
                    <DropdownItem href="#" title="Facillit Coach & Career" subtitle="Orientação vocacional." />
                    <DropdownItem href="#" title="Facillit Connect" subtitle="Rede social educacional." />
                  </DropdownColumn>
                  <DropdownColumn icon="fa-photo-video" title="Conteúdo & Criação">
                    <DropdownItem href="#" title="Facillit Play" subtitle="Streaming de videoaulas." />
                    <DropdownItem href="#" title="Facillit Library" subtitle="Biblioteca digital e portfólios." />
                    <DropdownItem href="#" title="Facillit Create" subtitle="Criação de mapas mentais." />
                  </DropdownColumn>
                </div>
              </div>
            </div>

            {/* Adicione os outros dropdowns aqui */}
          </nav>

          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <Link href="/login" className={`font-bold transition-colors hover:opacity-80 ${linkColor}`}>Acessar</Link>
            <Link href="/register" className={`py-2 px-5 rounded-md font-bold transition-all duration-300 ${buttonClass}`}>Criar conta</Link>
          </div>

          <div className="lg:hidden">
            <button onClick={() => setMenuOpen(!isMenuOpen)} className={`text-2xl ${linkColor}`}><i className="fas fa-bars"></i></button>
          </div>
        </div>
      </header>

      {/* Overlay do Menu Mobile */}
      <div className={`fixed top-0 left-0 w-full h-full bg-white z-[1100] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"} lg:hidden`}>
        <div className="flex justify-between items-center p-4 border-b">
          <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={30} height={30} />
          <button onClick={() => setMenuOpen(false)} className="text-3xl text-dark-text">&times;</button>
        </div>
        <div className="p-5">
           {/* Adicionar links do menu mobile aqui */}
        </div>
      </div>
    </>
  );
}
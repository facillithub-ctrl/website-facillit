"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- Dados para os Menus (COM ROTAS ATUALIZADAS) ---
const modulos = {
  "Estudo & Foco": [
    { href: "/modulos/facillit-edu", title: "Facillit Edu", subtitle: "Gestão pedagógica e de alunos." },
    { href: "/modulos/facillit-write", title: "Facillit Write", subtitle: "Escrita com correção de IA." },
    { href: "/modulos/facillit-test", title: "Facillit Test", subtitle: "Criação de simulados e provas." },
    { href: "/modulos/facillit-lab", title: "Facillit Lab", subtitle: "Laboratório virtual com simulações." },
  ],
  "Organização Pessoal": [
    { href: "/modulos/facillit-day", title: "Facillit Day", subtitle: "Agenda, tarefas, finanças e hábitos." },
    { href: "/modulos/facillit-task", title: "Facillit Task", subtitle: "Gestão de tarefas além dos estudos." },
  ],
  "Carreira & Skills": [
    { href: "/modulos/facillit-coach-career", title: "Facillit Coach & Career", subtitle: "Orientação vocacional." },
    { href: "/modulos/facillit-connect", title: "Facillit Connect", subtitle: "Rede social educacional." },
  ],
  "Conteúdo & Criação": [
    { href: "/modulos/facillit-play", title: "Facillit Play", subtitle: "Streaming de videoaulas." },
    { href: "/modulos/facillit-library", title: "Facillit Library", subtitle: "Biblioteca digital e portfólios." },
    { href: "/modulos/facillit-create", title: "Facillit Create", subtitle: "Criação de mapas mentais." },
    { href: "/modulos/facillit-games", title: "Facillit Games", subtitle: "jogos educacionais." },
  ],
};
const solucoes = [
    { href: "#", title: "Para Pessoas", subtitle: "Organização e desenvolvimento pessoal." },
    { href: "#", title: "Para Escolas", subtitle: "Inovação na gestão pedagógica." },
    { href: "#", title: "Para Empresas", subtitle: "Produtividade e bem-estar corporativo." },
];
const recursos = {
    "Empresa": [
      { href: "/recursos/sobre-nos", title: "Sobre Nós", subtitle: "Conheça nossa história e missão." }, 
      { href: "/recursos/carreiras", title: "Carreiras", subtitle: "Junte-se à nossa equipe." }
    ],
    "Suporte": [
      { href: "/recursos/contato", title: "Contato", subtitle: "Fale com nosso time." }, 
      { href: "/recursos/ajuda", title: "Central de Ajuda", subtitle: "Encontre respostas rápidas." }
    ],
    "Legal": [
      { href: "/recursos/uso", title: "Termos de Uso", subtitle: "Nossas políticas e termos." }, 
      { href: "recursos/blog", title: "Blog", subtitle: "Artigos e novidades." }
    ],
}

// --- Sub-componentes para os Dropdowns ---
const DropdownItem = ({ href, title, subtitle }: { href: string; title: string; subtitle: string; }) => (
  <li><Link href={href} className="group flex flex-col p-2 rounded-lg hover:bg-gray-100 transition-colors"><strong className="text-sm font-bold text-dark-text group-hover:text-royal-blue transition-colors">{title}</strong><span className="text-xs text-text-muted">{subtitle}</span></Link></li>
);
const DropdownColumn = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode; }) => (
  <div><h5 className="mb-4 flex items-center gap-2 text-base font-bold text-dark-text"><i className={`fas ${icon} text-royal-blue`}></i> {title}</h5><ul className="space-y-2">{children}</ul></div>
);

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isMenuOpen);
  }, [isMenuOpen]);

  const toggleMobileDropdown = (dropdown: string) => {
    setOpenMobileDropdown(openMobileDropdown === dropdown ? null : dropdown);
  };

  const headerClass = isScrolled ? "bg-white/95 shadow-md backdrop-blur-sm border-b border-gray-200" : "bg-transparent";
  const linkColor = isScrolled ? "text-dark-text hover:text-royal-blue" : "text-white hover:opacity-80";
  const logoFilter = isScrolled ? "" : "brightness-0 invert";
  const buttonClass = isScrolled ? "bg-royal-blue text-white" : "bg-white text-royal-blue";

  return (
    <>
      <header className={`fixed top-0 md:top-5 left-1/2 -translate-x-1/2 z-50 w-full md:w-[95%] md:max-w-[1400px] md:rounded-full transition-all duration-300 ${headerClass}`}>
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2">
            <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={28} height={28} className={`transition-all duration-300 ${logoFilter}`} />
            <span className={`font-bold text-lg hidden sm:inline transition-colors ${linkColor}`}>Facillit Hub</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 mx-auto">
            <Link href="/#hero" className={`font-bold transition-colors ${linkColor}`}>Início</Link>
            <Link href="/#features" className={`font-bold transition-colors ${linkColor}`}>Diferenciais</Link>
            
            <div className="group relative">
              <button className={`font-bold flex items-center gap-1 transition-colors ${linkColor}`}>Módulos <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i></button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white rounded-xl shadow-xl p-8 grid grid-cols-4 gap-x-10 gap-y-6 min-w-[950px] text-left">
                  <DropdownColumn icon="fa-graduation-cap" title="Estudo & Foco">{modulos["Estudo & Foco"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                  <DropdownColumn icon="fa-calendar-check" title="Organização Pessoal">{modulos["Organização Pessoal"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                  <DropdownColumn icon="fa-briefcase" title="Carreira & Skills">{modulos["Carreira & Skills"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                  <DropdownColumn icon="fa-photo-video" title="Conteúdo & Criação">{modulos["Conteúdo & Criação"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                </div>
              </div>
            </div>

            <div className="group relative">
              <button className={`font-bold flex items-center gap-1 transition-colors ${linkColor}`}>Soluções <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i></button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white rounded-xl shadow-xl p-8 grid grid-cols-1 gap-y-6 min-w-[320px] text-left">
                  <DropdownColumn icon="fa-bullseye" title="Nossas Soluções">{solucoes.map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                </div>
              </div>
            </div>

            <div className="group relative">
              <button className={`font-bold flex items-center gap-1 transition-colors ${linkColor}`}>Recursos <i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i></button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white rounded-xl shadow-xl p-8 grid grid-cols-3 gap-x-10 gap-y-6 min-w-[750px] text-left">
                  <DropdownColumn icon="fa-building" title="Empresa">{recursos["Empresa"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                  <DropdownColumn icon="fa-book" title="Suporte">{recursos["Suporte"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                  <DropdownColumn icon="fa-file-alt" title="Legal">{recursos["Legal"].map(item => <DropdownItem key={item.title} {...item} />)}</DropdownColumn>
                </div>
              </div>
            </div>
          </nav>
          
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <Link href="/login" className={`font-bold transition-colors ${linkColor}`}>Acessar</Link>
            <Link href="/register" className={`py-2 px-5 rounded-md font-bold transition-all duration-300 ${buttonClass}`}>Criar conta</Link>
          </div>
          
          <div className="lg:hidden"><button onClick={() => setMenuOpen(true)} className={`text-2xl transition-colors ${linkColor}`}><i className="fas fa-bars"></i></button></div>
        </div>
      </header>
      
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMenuOpen(false)}>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[1100] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0"><Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={28} height={28} /><button onClick={() => setMenuOpen(false)} className="text-3xl text-dark-text">&times;</button></div>
        <div className="overflow-y-auto p-5">
          <ul className="space-y-2">
            <li><Link href="/#hero" className="block py-3 text-lg font-medium" onClick={() => setMenuOpen(false)}>Início</Link></li>
            <li><Link href="/#features" className="block py-3 text-lg font-medium" onClick={() => setMenuOpen(false)}>Diferenciais</Link></li>
            <li>
              <button onClick={() => toggleMobileDropdown('modulos')} className="w-full flex justify-between items-center py-3 text-lg font-medium">Módulos <i className={`fas fa-chevron-down text-sm transition-transform ${openMobileDropdown === 'modulos' ? 'rotate-180' : ''}`}></i></button>
              <div className={`overflow-hidden transition-all duration-300 ${openMobileDropdown === 'modulos' ? 'max-h-[500px]' : 'max-h-0'}`}><ul className="pl-4 mt-2 space-y-2 border-l-2">{Object.values(modulos).flat().map(item => <li key={item.title}><Link href={item.href} className="block py-2 text-text-muted" onClick={() => setMenuOpen(false)}>{item.title}</Link></li>)}</ul></div>
            </li>
            <li>
              <button onClick={() => toggleMobileDropdown('solucoes')} className="w-full flex justify-between items-center py-3 text-lg font-medium">Soluções <i className={`fas fa-chevron-down text-sm transition-transform ${openMobileDropdown === 'solucoes' ? 'rotate-180' : ''}`}></i></button>
              <div className={`overflow-hidden transition-all duration-300 ${openMobileDropdown === 'solucoes' ? 'max-h-96' : 'max-h-0'}`}><ul className="pl-4 mt-2 space-y-2 border-l-2">{solucoes.map(item => <li key={item.title}><Link href={item.href} className="block py-2 text-text-muted" onClick={() => setMenuOpen(false)}>{item.title}</Link></li>)}</ul></div>
            </li>
            <li>
              <button onClick={() => toggleMobileDropdown('recursos')} className="w-full flex justify-between items-center py-3 text-lg font-medium">Recursos <i className={`fas fa-chevron-down text-sm transition-transform ${openMobileDropdown === 'recursos' ? 'rotate-180' : ''}`}></i></button>
              <div className={`overflow-hidden transition-all duration-300 ${openMobileDropdown === 'recursos' ? 'max-h-96' : 'max-h-0'}`}><ul className="pl-4 mt-2 space-y-2 border-l-2">{Object.values(recursos).flat().map(item => <li key={item.title}><Link href={item.href} className="block py-2 text-text-muted" onClick={() => setMenuOpen(false)}>{item.title}</Link></li>)}</ul></div>
            </li>
          </ul>
        </div>
        <div className="mt-auto p-5 border-t flex gap-4"><Link href="/login" className="flex-1 text-center py-3 rounded-lg border border-gray-300 font-bold">Acessar</Link><Link href="/register" className="flex-1 text-center py-3 rounded-lg bg-royal-blue text-white font-bold">Criar conta</Link></div>
      </div>
    </>
  );
}
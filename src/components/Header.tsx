"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [isScrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        {/* Adapte o HTML do seu header original aqui */}
        <div className="container header-content">
            <div className="logo"><img src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" style={{filter: isScrolled ? 'none' : 'brightness(0) invert(1)'}} /></div>
            <div className="header-right">
                <Link href="/login" className={`btn-link ${isScrolled ? 'text-royal-blue' : 'text-white'}`}>Acessar</Link>
                <Link href="/register" className={`btn ${isScrolled ? 'btn-primary-scrolled' : 'btn-primary'}`}>Criar conta</Link>
            </div>
        </div>
    </header>
  );
}
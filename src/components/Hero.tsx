"use client";

import { useEffect } from 'react';
import Script from 'next/script';

export default function Hero() {
  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: { number: { value: 110 }, color: { value: "#ffffff" }, shape: { type: "circle" }, opacity: { value: 0.5 }, size: { value: 3, random: true }, line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 }, move: { enable: true, speed: 3, direction: "none", out_mode: "out" } }, interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true }, modes: { repulse: { distance: 90 }, push: { particles_nb: 4 } } }, retina_detect: true
      });
    }
  }, []);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" strategy="lazyOnload" />
      <section className="section" id="hero">
        <div id="particles-js"></div>
        <div className="hero-content">
          <h1 className="hero-title">Transformando Ideias em Resultados Reais</h1>
          <p className="hero-subtitle">Integramos educação, produtividade e bem-estar em uma experiência única, simples e eficaz.</p>
          <a href="#modules" className="hero-cta-button">Explore o Ecossistema</a>
        </div>
        <div className="scroll-down-indicator">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>
    </>
  );
}
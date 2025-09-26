"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim"; // Importa o pacote slim que você instalou

export default function Hero() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // Inicia o motor de partículas e carrega o pacote slim
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log("Particles loaded", container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent", // O fundo já está na section
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.4,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (init) {
    return (
      <section 
        id="hero" 
        className="relative min-h-screen flex flex-col justify-center items-center text-center text-white p-5 overflow-hidden"
        style={{ background: 'linear-gradient(45deg, #1a237e, #2e14ed, #4a148c)' }}
      >
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={options}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Transformando Ideias em Resultados Reais
          </h1>
          <p className="text-lg md:text-xl mb-10 opacity-90">
            Integramos educação, produtividade e bem-estar em uma experiência única, simples e eficaz.
          </p>
          <a 
            href="#modules" 
            className="inline-block bg-gray-200 text-royal-blue py-4 px-10 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-105"
          >
            Explore o Ecossistema
          </a>
        </div>
        <div className="scroll-down-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <i className="fas fa-chevron-down text-2xl text-white"></i>
        </div>
      </section>
    );
  }

  return <div className="min-h-screen" />; // Retorna um placeholder enquanto carrega
}
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // A lógica de detecção de preferência foi mantida, mas a aplicação da classe foi removida abaixo.
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    // Forçamos o tema para 'light' para desativar o modo escuro
    setTheme('light');
  }, []);

  useEffect(() => {
    // MODIFICADO: Lógica de manipulação da classe 'dark' foi comentada/removida
    // para desativar a troca de tema visualmente.
    /*
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    */

    // Garante que a classe 'dark' seja sempre removida
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');

  }, [theme]);

  const toggleTheme = () => {
    // A função de troca agora não terá efeito visual
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
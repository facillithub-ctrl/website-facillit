"use client";

import { useEffect, useState } from 'react';

type ToastProps = {
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

const icons = {
  success: <i className="fas fa-check-circle"></i>,
  error: <i className="fas fa-exclamation-triangle"></i>,
};

const colors = {
  success: {
    bg: 'bg-green-500',
    progress: 'bg-green-300',
  },
  error: {
    bg: 'bg-red-500',
    progress: 'bg-red-300',
  },
};

export default function Toast({ title, message, type, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Fecha automaticamente após 5 segundos
    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 2 : 0));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onClose]);

  return (
    <div className={`relative flex items-start text-white p-4 rounded-lg shadow-lg w-80 animate-fade-in-right overflow-hidden ${colors[type].bg}`}>
      <div className="text-xl mr-4 mt-1">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="absolute top-2 right-2 text-white/70 hover:text-white">
        <i className="fas fa-times text-xs"></i>
      </button>
      <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
        <div className={`${colors[type].progress} h-1`} style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
      </div>
    </div>
  );
}
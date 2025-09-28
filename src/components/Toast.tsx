"use client";

import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

const icons = {
  success: <i className="fas fa-check-circle"></i>,
  error: <i className="fas fa-times-circle"></i>,
};

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Fecha automaticamente após 5 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`relative flex items-center text-white p-4 rounded-lg shadow-lg animate-fade-in-right ${colors[type]}`}>
      <div className="text-xl mr-3">{icons[type]}</div>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="absolute top-1 right-1 text-white/70 hover:text-white">
        <i className="fas fa-times text-xs"></i>
      </button>
    </div>
  );
}
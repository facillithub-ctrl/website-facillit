"use client";

import { useState, useEffect } from 'react';

type Props = {
  targetExam: string | null | undefined;
  examDate: string | null | undefined;
};

export default function CountdownWidget({ targetExam, examDate }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetExam || !examDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(examDate);
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const interval = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Calcula imediatamente

    return () => clearInterval(interval);
  }, [targetExam, examDate]);

  if (!targetExam || !examDate || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0)) {
     return (
        <div className="h-full flex flex-col justify-center text-center">
            <h2 className="font-bold mb-2 dark:text-white">Contagem Regressiva</h2>
            <p className="text-sm text-text-muted dark:text-gray-400">Defina um vestibular alvo no seu perfil para ver a contagem aqui.</p>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center">
      <h2 className="font-bold mb-2 dark:text-white text-center">Contagem Regressiva: {targetExam}</h2>
      <div className="grid grid-cols-4 text-center">
        <div>
          <p className="text-3xl font-bold text-royal-blue">{timeLeft.days}</p>
          <p className="text-xs text-text-muted dark:text-gray-400">Dias</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-royal-blue">{timeLeft.hours}</p>
          <p className="text-xs text-text-muted dark:text-gray-400">Horas</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-royal-blue">{timeLeft.minutes}</p>
          <p className="text-xs text-text-muted dark:text-gray-400">Min</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-royal-blue">{timeLeft.seconds}</p>
          <p className="text-xs text-text-muted dark:text-gray-400">Seg</p>
        </div>
      </div>
    </div>
  );
}
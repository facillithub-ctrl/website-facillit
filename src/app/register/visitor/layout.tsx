// Caminho: src/app/register/visitor/layout.tsx (Novo Arquivo)

import { ToastProvider } from '@/contexts/ToastContext';

export default function VisitorRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
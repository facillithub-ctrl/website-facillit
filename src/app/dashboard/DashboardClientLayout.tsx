"use client";

import { useState } from 'react';
import type { UserProfile } from './types';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Onboarding from './onboarding/Onboarding';
import { ToastProvider } from '@/contexts/ToastContext'; // 1. Importe o ToastProvider

type LayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  // Se o onboarding não foi concluído, mostra a página de seleção
  if (!userProfile.has_completed_onboarding) {
    // Envolvemos o Onboarding também, caso ele precise de toasts no futuro
    return (
      <ToastProvider>
        <Onboarding userProfile={userProfile} />
      </ToastProvider>
    );
  }

  // Se já concluiu, mostra o dashboard normal
  return (
    // 2. Envolva todo o layout do dashboard com o ToastProvider
    <ToastProvider>
      <div className="flex h-screen bg-background-light dark:bg-gray-900">
        <Sidebar 
          userProfile={userProfile} 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setDesktopCollapsed}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar 
            userProfile={userProfile} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
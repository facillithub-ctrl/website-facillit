"use client";

import { useState } from 'react';
import type { UserProfile } from './types';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

type LayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, children }: LayoutProps) {
  // Estado para controlar a sidebar em telas pequenas (mobile)
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // NOVO ESTADO: para controlar o recolhimento em telas grandes (desktop)
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
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
  );
}
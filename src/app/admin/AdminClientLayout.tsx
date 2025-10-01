"use client";

import { useState } from 'react';
import type { UserProfile } from '@/app/dashboard/types';
import AdminSidebar from './AdminSidebar';
import Topbar from '@/components/dashboard/Topbar';

type AdminClientLayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function AdminClientLayout({ userProfile, children }: AdminClientLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background-light dark:bg-gray-900">
      <AdminSidebar 
        isMobileOpen={isSidebarOpen} 
        setIsMobileOpen={setSidebarOpen} 
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
import React, { ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { useApp } from '../../context/AppContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { previewRole, setAdminPreviewRole, currentUser } = useApp();

  return (
    <div id="admin-shell" className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col antialiased selection:bg-purple-500 selection:text-white">
      {/* 1. Admin Header (Stationary at top of application shell) */}
      <AdminHeader />

      {/* 2. Admin Body: Stationary Sidebar on left + Primary Scroll Area on right */}
      <div id="admin-body" className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Stationary Admin Sidebar */}
        <AdminSidebar />

        {/* 3. Primary & ONLY Admin Content Vertical Scroll Container */}
        <main
          id="admin-main"
          className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 bg-slate-50/70 p-4 sm:p-6 lg:p-8 custom-scrollbar"
        >
          <div className="max-w-7xl mx-auto w-full space-y-6 pb-16">
            {/* Admin Preview Mode Banner if active */}
            {previewRole && currentUser && (
              <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-sm flex items-center justify-between font-medium text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
                  <span>
                    <strong>ADMIN PREVIEW MODE:</strong> Viewing interface as{' '}
                    <strong>{previewRole}</strong>. Actual database role remains{' '}
                    <strong>{currentUser.role}</strong>.
                  </span>
                </div>
                <button
                  onClick={() => setAdminPreviewRole(null)}
                  className="px-3 py-1 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition-all cursor-pointer text-xs"
                >
                  Exit Preview & Return to Admin
                </button>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

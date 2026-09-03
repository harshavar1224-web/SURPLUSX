import React, { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { AdminHeader } from '../admin/AdminHeader';
import { DashboardHeader } from './DashboardHeader';
import { AdminSidebar } from '../admin/AdminSidebar';
import { AppSidebar } from '../navigation/AppSidebar';
import { SurplusXFooter } from '../SurplusXFooter';
import { useApp } from '../../context/AppContext';
import { isAdminRole } from '../../types';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, previewRole, setAdminPreviewRole, sidebarWidth, setSidebarWidth, isSidebarCollapsed } = useApp();
  const isAdmin = isAdminRole(currentUser?.role);

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  }, []);

  const stopResizing = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    setIsResizing(false);
    try {
      const target = e.currentTarget as HTMLElement;
      target.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, [isResizing]);

  const onResize = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 240 && newWidth <= 420) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing, setSidebarWidth]);

  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(300);
  }, [setSidebarWidth]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const effectiveWidth = isSidebarCollapsed ? 80 : sidebarWidth;

  return (
    <div id="dashboard-shell" className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. Global Header spanning 100% viewport width at the very top */}
      <div id="global-header-wrapper" className="shrink-0 w-full h-20 z-40 bg-white border-b border-slate-200/80 shadow-xs flex items-center">
        {isAdmin ? <AdminHeader /> : <DashboardHeader />}
      </div>

      {/* 2. Dashboard Body using CSS Grid for exact boundary synchronization */}
      <div
        id="dashboard-body"
        className="flex-1 grid grid-cols-1 md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] overflow-hidden min-h-0 relative"
        style={{ '--sidebar-width': `${effectiveWidth}px` } as React.CSSProperties}
      >
        {/* Left Role Sidebar (Desktop grid cell + Mobile Drawer) */}
        <div
          ref={sidebarRef}
          className="relative h-full hidden md:flex flex-row overflow-hidden select-none bg-white border-r border-slate-200/80"
        >
          <div className="w-full h-full overflow-hidden">
            {isAdmin ? <AdminSidebar /> : <AppSidebar />}
          </div>

          {/* Resize Handle on the Right Edge (Desktop only when not collapsed) */}
          {!isSidebarCollapsed && (
            <div
              className="absolute top-0 right-0 w-2.5 h-full cursor-col-resize z-30 group flex items-center justify-center bg-transparent hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors"
              onPointerDown={startResizing}
              onPointerMove={onResize}
              onPointerUp={stopResizing}
              onPointerCancel={stopResizing}
              onDoubleClick={handleDoubleClick}
              title="Drag to resize sidebar (Double-click to reset)"
              aria-label="Resize sidebar"
            >
              <div className="w-0.5 h-12 rounded-full bg-slate-300 group-hover:bg-emerald-500 group-active:bg-emerald-600 transition-colors" />
            </div>
          )}
        </div>

        {/* Mobile Drawer Sidebar */}
        <div className="md:hidden contents">
          {isAdmin ? <AdminSidebar /> : <AppSidebar />}
        </div>

        {/* Right Main Content Grid Column */}
        <main
          id="dashboard-main-content"
          className="h-full overflow-y-auto overflow-x-hidden min-w-0 bg-slate-50/70 custom-scrollbar flex flex-col justify-between"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full space-y-6 pb-8">
              {/* Admin Preview Mode Banner if active */}
              {previewRole && currentUser && isAdmin && (
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
          </div>

          <SurplusXFooter />
        </main>
      </div>
    </div>
  );
};

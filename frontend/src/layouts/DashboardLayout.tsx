import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

type DashboardLayoutProps = {
  children: ReactNode;
  onSignOut: () => void;
};

export function DashboardLayout({
  children,
  onSignOut,
}: DashboardLayoutProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const getTitle = () => {
    if (pathname.includes('biblioteca')) return 'Biblioteca Virtual';
    if (pathname.includes('articulos')) return 'Mis Manuscritos';
    if (pathname.includes('revisiones')) return 'Panel de Evaluación';
    return 'Resumen de Investigación';
  };

  return (
    <div className="min-h-[100dvh] bg-[#f2f7f4]">
      <Sidebar
        collapsed={collapsed}
        onSignOut={onSignOut}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <div
        className={`min-h-[100dvh] transition-[padding] duration-300 ${
          collapsed ? 'md:pl-[82px]' : 'md:pl-[252px]'
        }`}
      >
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#d5e6df] bg-[#f8fcfa]/95 px-5 pl-[68px] backdrop-blur md:px-9 md:pl-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#52766d]">
              Hospital Interdistrital Evita
            </p>
            <h1 className="mt-1 text-[16px] font-semibold tracking-[-.02em] text-[#173d3b]">
              {getTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-5">
            <div className="hidden items-center gap-2 rounded-full border border-[#cfe4dc] bg-[#fcfefd] px-3 py-2 text-[11px] text-[#385f56] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#16966c]" />
              <span>API Conectada</span>
            </div>
            <div className="hidden h-7 w-px bg-[#d5e6df] sm:block" />
            <div className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bce8d8] text-[11px] font-bold text-[#07584f]">
                {user?.first_name?.charAt(0) ?? 'U'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-semibold text-[#244f47]">
                  {user
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : 'Mi Perfil'}
                </span>
                <span className="block text-[10px] text-[#52766d]">
                  {user?.role ?? 'HIEF Journal'}
                </span>
              </span>
              <ChevronDown
                className="hidden text-[#52766d] sm:block"
                size={13}
              />
            </div>
          </div>
        </header>
        <main className="page-enter mx-auto max-w-[1440px] px-5 py-8 md:px-9 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

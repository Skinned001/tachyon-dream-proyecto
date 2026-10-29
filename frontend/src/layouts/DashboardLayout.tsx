import { Bell, ChevronDown, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';

type Props = { children: ReactNode; onSignOut: () => void };

export function DashboardLayout({ children, onSignOut }: Props) {
  const { pathname: path } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const getTitle = () => {
    if (path.includes('biblioteca')) return 'Biblioteca Virtual';
    if (path.includes('articulos')) return 'Mis Manuscritos';
    if (path.includes('revisiones')) return 'Panel de Evaluación';
    return 'Resumen de Investigación';
  };

  return <div className="min-h-[100dvh] bg-[#f2f7f4]">
    <Sidebar
      collapsed={collapsed}
      onSignOut={onSignOut}
      onToggleCollapsed={() => setCollapsed((value) => !value)}
    />
    <div className={`min-h-[100dvh] transition-[padding] duration-300 ${collapsed ? 'md:pl-[82px]' : 'md:pl-[252px]'}`}>
      <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#d5e6df] bg-[#f8fcfa]/95 px-5 pl-[68px] backdrop-blur md:px-9 md:pl-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#52766d]">Hospital Interdistrital Evita</p>
            <h1 className="mt-1 text-[16px] font-semibold tracking-[-.02em] text-[#173d3b]">{getTitle()}</h1>
          </div>
        <div className="flex items-center gap-2 md:gap-5">
          <button className="hidden items-center gap-2 rounded-full border border-[#cfe4dc] bg-[#fcfefd] px-3 py-2 text-[11px] text-[#385f56] hover:border-[#72bda3] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#16966c]" /><span>API Conectada</span>
          </button>
          <div className="hidden h-7 w-px bg-[#d5e6df] sm:block" />
          <button className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1.5 hover:bg-[#e2f2eb]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bce8d8] text-[11px] font-bold text-[#07584f]">U</span>
            <span className="hidden text-left sm:block">
              <span className="block text-[11px] font-semibold text-[#244f47]">Mi Perfil</span>
              <span className="block text-[10px] text-[#52766d]">HIEF Journal</span>
            </span>
            <ChevronDown className="hidden text-[#52766d] sm:block" size={13} />
          </button>
        </div>
      </header>
      <main className="page-enter mx-auto max-w-[1440px] px-5 py-8 md:px-9 md:py-10">{children}</main>
    </div>
  </div>;
}
import { Activity, BookOpen, ChevronLeft, ChevronRight, ClipboardList, LogOut, Menu, X, FileText, CheckSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

type SidebarProps = { onSignOut: () => void; collapsed: boolean; onToggleCollapsed: () => void };

export function Sidebar({ onSignOut, collapsed, onToggleCollapsed }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: '/', label: 'Inicio', icon: Activity, end: true },
    { to: '/articulos', label: 'Mis Artículos', icon: FileText },
    { to: '/revisiones', label: 'Panel de Revisión', icon: CheckSquare },
    { to: '/biblioteca', label: 'Biblioteca virtual', icon: BookOpen },
  ];

  return <>
      <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[#c8e1d8] bg-[#fcfefd] text-[#07584f] shadow-sm md:hidden">
      {mobileOpen ? <X size={19} /> : <Menu size={19} />}
    </button>
    {mobileOpen && <button onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-[#103a35]/30 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#cfe4dc] bg-[#e7f4ee] transition-all duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'md:w-[82px]' : 'md:w-[252px]'} w-[252px]`}>
      <div className="flex h-[88px] items-center gap-3 border-b border-[#cfe4dc] px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087d70] text-[#f4fffb]"><ClipboardList size={20} strokeWidth={1.7} /></div>
        {!collapsed && <div className="min-w-0"><p className="text-[13px] font-bold tracking-wide text-[#173d3b]">HOSPITAL EVITA</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">Chief Journal</p></div>}
      </div>
      <div className="px-4 pt-8">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#58786f]">Área de trabajo</p>}
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink end={end} key={to} onClick={() => setMobileOpen(false)} to={to}
            className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${isActive ? 'bg-[#bce8d8] text-[#07584f] shadow-[inset_3px_0_0_#087d70]' : 'text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]'}`}>
            <Icon size={18} strokeWidth={1.8} />{!collapsed && <span>{label}</span>}
          </NavLink>)}
        </nav>
      </div>
      <div className="mt-auto px-4 pb-5">
        <button onClick={onToggleCollapsed} className="mb-3 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-[#45665f] hover:bg-[#d5eee4] md:flex">
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Contraer menú</span></>}
        </button>
        <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]">
          <LogOut size={17} />{!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  </>;
}
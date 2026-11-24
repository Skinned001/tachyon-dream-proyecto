import {
  Activity,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FileUp,
  FolderOpen,
  Inbox,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user.types';

type SidebarLink = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  allowedRoles?: UserRole[];
  requireAuthor?: boolean;
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

type SidebarProps = {
  onSignOut: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

const sections: SidebarSection[] = [
  {
    title: 'General',
    links: [
      { to: '/dashboard', label: 'Inicio', icon: Activity, end: true },
      { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
    ],
  },
  {
    title: 'Flujo Editorial',
    links: [
      {
        to: '/articulos',
        label: 'Mis Artículos',
        icon: FileText,
        requireAuthor: true,
      },
      {
        to: '/mesa-entrada',
        label: 'Mesa de Entrada',
        icon: Inbox,
        allowedRoles: ['DDI', 'ADMIN'],
      },
      {
        to: '/revisiones',
        label: 'Panel de Revisión',
        icon: CheckSquare,
        allowedRoles: ['COMITE', 'ADMIN'],
      },
      {
        to: '/editor',
        label: 'Panel del Editor',
        icon: FileUp,
        allowedRoles: ['EDITOR', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Gestión',
    links: [
      {
        to: '/convocatorias',
        label: 'Convocatorias',
        icon: Megaphone,
        allowedRoles: ['ADMIN', 'EDITOR'],
      },
      {
        to: '/recursos-biblioteca',
        label: 'Manuales',
        icon: FolderOpen,
        allowedRoles: ['ADMIN', 'EDITOR'],
      },
    ],
  },
  {
    title: 'Administración',
    links: [
      {
        to: '/admin/usuarios',
        label: 'Usuarios',
        icon: Users,
        allowedRoles: ['ADMIN'],
      },
      {
        to: '/admin/auditoria',
        label: 'Auditoría',
        icon: ShieldCheck,
        allowedRoles: ['ADMIN'],
      },
      {
        to: '/admin/especialidades',
        label: 'Especialidades',
        icon: Stethoscope,
        allowedRoles: ['ADMIN'],
      },
    ],
  },
];

export function Sidebar({
  onSignOut,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const canSeeLink = ({ allowedRoles, requireAuthor }: SidebarLink): boolean => {
    if (!allowedRoles && !requireAuthor) return true;
    if (!user) return false;
    if (allowedRoles && allowedRoles.includes(user.role)) return true;
    if (requireAuthor && (user.is_author || user.role === 'ADMIN')) return true;
    return false;
  };

  const visibleSections = sections
    .map((section) => ({
      ...section,
      links: section.links.filter(canSeeLink),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[#c8e1d8] bg-[#fcfefd] text-[#07584f] shadow-sm md:hidden"
      >
        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[#103a35]/30 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#cfe4dc] bg-[#e7f4ee] transition-all duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-[82px]' : 'md:w-[252px]'} w-[252px]`}
      >
        <div className="flex h-[74px] shrink-0 items-center gap-3 border-b border-[#cfe4dc] px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087d70] text-[#f4fffb]">
            <ClipboardList size={20} strokeWidth={1.7} />
          </div>
          <div className={`min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
            <p className="text-[13px] font-bold tracking-wide text-[#173d3b]">
              HOSPITAL EVITA
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
              Chief Journal
            </p>
          </div>
        </div>

        <nav className="scrollbar-subtle flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p
                className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.15em] text-[#58786f] ${
                  collapsed ? 'md:hidden' : ''
                }`}
              >
                {section.title}
              </p>
              <div className="space-y-1">
                {section.links.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    end={end}
                    key={to}
                    title={collapsed ? label : undefined}
                    onClick={() => setMobileOpen(false)}
                    to={to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        collapsed ? 'md:justify-center md:px-0' : ''
                      } ${
                        isActive
                          ? 'bg-[#bce8d8] text-[#07584f] shadow-[inset_3px_0_0_#087d70]'
                          : 'text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]'
                      }`
                    }
                  >
                    <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                    <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-[#cfe4dc] px-3 py-4">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="mb-2 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-[#45665f] hover:bg-[#d5eee4] md:flex"
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span>Contraer menú</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f] ${
              collapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

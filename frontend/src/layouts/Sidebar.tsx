import {
  Activity,
  BookOpen,
<<<<<<< HEAD
  ChevronDown,
=======
  CheckSquare,
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FileUp,
  FolderOpen,
  Inbox,
  LogOut,
  Megaphone,
<<<<<<< HEAD
  Settings,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotificaciones } from "../api/notificaciones.api";
import type { UserRole } from "../types/user.types";
=======
  Menu,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user.types';
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0

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
    ],
  },
];

export function Sidebar({
  onSignOut,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { user } = useAuth();
<<<<<<< HEAD
  const { pathname } = useLocation();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin/')) {
      setIsAdminOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    let isCurrent = true;
    const fetchUnread = async () => {
      try {
        const notifications = await getNotificaciones();
        if (isCurrent) {
          setHasUnread(notifications.some((notification) => !notification.read));
        }
      } catch (error: unknown) {
        console.error('Error al cargar el indicador de notificaciones:', error);
      }
    };

    const refreshUnread = () => void fetchUnread();
    refreshUnread();
    window.addEventListener('notifications-updated', refreshUnread);

    return () => {
      isCurrent = false;
      window.removeEventListener('notifications-updated', refreshUnread);
    };
  }, []);

  const links: SidebarLink[] = [
    { to: "/dashboard", label: "Inicio", icon: Activity, end: true },
    { to: "/articulos", label: "Mis Artículos", icon: FileText },
    {
      to: "/revisiones",
      label: "Panel de Revisión",
      icon: CheckSquare,
      allowedRoles: ["ADMIN", "DDI", "COMITE"],
    },
    {
      to: "/editor",
      label: "Panel del Editor",
      icon: CheckSquare,
      allowedRoles: ["ADMIN", "EDITOR", "DDI"],
    },
    { to: "/biblioteca", label: "Biblioteca virtual", icon: BookOpen },
    {
      to: "/convocatorias",
      label: "Convocatorias",
      icon: Megaphone,
      allowedRoles: ["ADMIN", "EDITOR"],
    },
  ];
  const visibleLinks = links.filter(
    ({ allowedRoles }) =>
      !allowedRoles || Boolean(user && allowedRoles.includes(user.role)),
  );
=======

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
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0

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
<<<<<<< HEAD
        <div className="flex h-[88px] shrink-0 items-center gap-3 border-b border-[#cfe4dc] px-5">
=======
        <div className="flex h-[74px] shrink-0 items-center gap-3 border-b border-[#cfe4dc] px-5">
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
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
<<<<<<< HEAD
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-8">
          <p
            className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#58786f] ${collapsed ? "md:hidden" : ""}`}
          >
            Área de trabajo
          </p>
          <nav className="space-y-1">
            {visibleLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                end={end}
                key={to}
                onClick={() => setMobileOpen(false)}
                to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${isActive ? "bg-[#bce8d8] text-[#07584f] shadow-[inset_3px_0_0_#087d70]" : "text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]"}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/notificaciones"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#bce8d8] text-[#07584f] shadow-[inset_3px_0_0_#087d70]"
                    : "text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]"
                }`
              }
            >
              <span className="relative">
                <Bell size={18} strokeWidth={1.8} />
                {hasUnread && (
                  <span
                    aria-label="Notificaciones no leídas"
                    className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#e7f4ee] bg-red-500"
                  />
                )}
              </span>
              <span className={collapsed ? "md:hidden" : ""}>
                Notificaciones
              </span>
            </NavLink>
            {user?.role === "ADMIN" && (
              <div className="mt-4">
                {!collapsed && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#58786f]">
                    Administración
                  </p>
                )}
                <button
                  type="button"
                  aria-expanded={isAdminOpen}
                  aria-controls="admin-submenu"
                  onClick={() => setIsAdminOpen((isOpen) => !isOpen)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${
                    pathname.startsWith('/admin/')
                      ? "bg-[#bce8d8] text-[#07584f]"
                      : "text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Settings size={18} strokeWidth={1.8} />
                    <span className={collapsed ? "md:hidden" : ""}>
                      Gestión del Sistema
                    </span>
                  </span>
                  {!collapsed &&
                    (isAdminOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>
                {isAdminOpen && (
                  <div
                    id="admin-submenu"
                    className={`mt-1 flex flex-col gap-1 border-l-2 border-[#cfe4dc] ${
                      collapsed ? 'ml-2 pl-1' : 'ml-8 pl-2'
                    }`}
                  >
                    <NavLink
                      to="/admin/usuarios"
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? 'Manejo de Usuarios' : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-[#bce8d8] text-[#07584f]'
                            : 'text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]'
                        }`
                      }
                    >
                      <Users size={16} strokeWidth={1.8} />
                      <span className={collapsed ? "md:hidden" : ""}>
                        Manejo de Usuarios
                      </span>
                    </NavLink>
                    <NavLink
                      to="/admin/especialidades"
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? 'Especialidades' : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-[#bce8d8] text-[#07584f]'
                            : 'text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]'
                        }`
                      }
                    >
                      <Stethoscope size={16} strokeWidth={1.8} />
                      <span className={collapsed ? "md:hidden" : ""}>
                        Especialidades
                      </span>
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
        <div className="mt-auto shrink-0 border-t border-[#cfe4dc] px-4 pb-5 pt-4">
=======

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
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
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

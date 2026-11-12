import {
  Activity,
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  X,
  FileUp,
  Inbox,
  Users,
  FileText,
  CheckSquare,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotificaciones } from "../api/notificaciones.api";
import type { UserRole } from "../types/user.types";

type SidebarLink = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  allowedRoles?: UserRole[];
};

type SidebarProps = {
  onSignOut: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({
  onSignOut,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

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
    { to: "/revisiones", label: "Panel de Revisión", icon: CheckSquare },
    { to: "/editor", label: "Panel del Editor", icon: CheckSquare },
    { to: "/biblioteca", label: "Biblioteca virtual", icon: BookOpen },
    {
      to: "/convocatorias",
      label: "Convocatorias",
      icon: Megaphone,
      allowedRoles: ["ADMIN"],
    },
    {
      to: "/admin/usuarios/pendientes",
      label: "Solicitudes de registro",
      icon: Users,
      allowedRoles: ["ADMIN"],
    },
  ];
  const visibleLinks = links.filter(
    ({ allowedRoles }) =>
      !allowedRoles || Boolean(user && allowedRoles.includes(user.role)),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[#c8e1d8] bg-[#fcfefd] text-[#07584f] shadow-sm md:hidden"
      >
        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[#103a35]/30 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#cfe4dc] bg-[#e7f4ee] transition-all duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-[82px]" : "md:w-[252px]"} w-[252px]`}
      >
        <div className="flex h-[88px] items-center gap-3 border-b border-[#cfe4dc] px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087d70] text-[#f4fffb]">
            <ClipboardList size={20} strokeWidth={1.7} />
          </div>
          <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
            <p className="text-[13px] font-bold tracking-wide text-[#173d3b]">
              HOSPITAL EVITA
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
              Chief Journal
            </p>
          </div>
        </div>
        <div className="px-4 pt-8">
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
              <NavLink
                to="/admin/usuarios"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#bce8d8] text-[#07584f] shadow-[inset_3px_0_0_#087d70]"
                      : "text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]"
                  }`
                }
              >
                <Users size={18} strokeWidth={1.8} />
                <span className={collapsed ? "md:hidden" : ""}>
                  Manejo de Usuarios
                </span>
              </NavLink>
            )}
          </nav>
        </div>
        <div className="mt-auto px-4 pb-5">
          <button
            onClick={onToggleCollapsed}
            className="mb-3 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-[#45665f] hover:bg-[#d5eee4] md:flex"
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#45665f] hover:bg-[#d5eee4] hover:text-[#07584f]"
          >
            <LogOut size={17} />
            <span className={collapsed ? "md:hidden" : ""}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

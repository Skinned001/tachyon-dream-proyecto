import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { BibliotecaHome } from '../pages/BibliotecaHome';

export const BibliotecaRoute = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error: unknown) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-[100dvh] items-center justify-center bg-[#f2f7f4] text-sm text-[#52766d]"
      >
        Verificando sesión...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <DashboardLayout onSignOut={handleSignOut}>
        <BibliotecaHome />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f2f7f4]">
      <header className="sticky top-0 z-30 border-b border-[#d5e6df] bg-[#f8fcfa]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 md:px-9">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Volver al portal institucional"
          >
            <img
              src="/images/evita_1.jpg"
              alt="Emblema Hospital Interdistrital Evita"
              className="h-10 w-10 rounded-xl border border-[#cfe4dc] object-cover shadow-sm"
            />
            <span className="leading-tight">
              <span className="block text-xs font-bold tracking-[.1em] text-[#102f2d] sm:text-sm">
                HOSPITAL INTERDISTRITAL EVITA
              </span>
              <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[.14em] text-[#355d55]">
                Biblioteca Pública · HIEF
              </span>
            </span>
            <span
              className="mx-1 hidden h-8 w-px bg-[#cfe4dc] lg:block"
              aria-hidden="true"
            />
            <img
              src="/images/Horizontal%201-1.png"
              alt="Instituto Politécnico Formosa Dr. Alberto Marcelo Zorrilla"
              className="hidden h-9 w-auto object-contain lg:block"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#b9d8ca] bg-white px-4 text-xs font-semibold text-[#102f2d] transition hover:border-[#087d70] hover:bg-[#edf6f2] sm:text-sm"
            >
              <ArrowLeft size={15} />
              Volver al inicio
            </Link>
            <Link
              to="/login"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#087d70] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#07584f] sm:text-sm"
            >
              Acceso institucional
              <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <main className="px-5 py-8 md:px-9 md:py-10">
        <div className="mx-auto max-w-[1440px]">
          <BibliotecaHome />
        </div>
      </main>
    </div>
  );
};

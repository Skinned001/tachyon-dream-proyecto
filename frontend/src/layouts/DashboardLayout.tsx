// src/layouts/DashboardLayout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, FileText, CheckSquare, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-institucional-700">HIEF Journal</h1>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors">
            <Home className="w-5 h-5" />
            Inicio
          </Link>
          <Link to="/mis-articulos" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors">
            <FileText className="w-5 h-5" />
            Mis Artículos
          </Link>
          <Link to="/revisiones" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors">
            <CheckSquare className="w-5 h-5" />
            Revisiones
          </Link>
          <Link to="/biblioteca" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-institucional-50 hover:text-institucional-700 transition-colors">
            <BookOpen className="w-5 h-5" />
            Biblioteca
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              Usuario: {user?.first_name} {user?.last_name} ({user?.role})
            </span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

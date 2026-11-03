import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { getUsuarios } from '../api/usuarios.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { User } from '../types/user.types';

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios();
        if (isMounted) setUsuarios(data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar usuarios',
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchUsuarios();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-[32px] leading-tight tracking-[-.03em] text-[#173d3b]">
            Gestión de Usuarios
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Administra las cuentas del sistema
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          className="flex shrink-0 items-center gap-2"
          disabled
          title="La creación de usuarios estará disponible próximamente"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div
            className="flex justify-center p-8"
            role="status"
            aria-label="Cargando usuarios"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#087d70]" />
          </div>
        ) : error ? (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600"
            role="alert"
          >
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Usuario
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Rol
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {usuario.first_name} {usuario.last_name}
                      <br />
                      <span className="text-xs font-normal text-gray-400">
                        @{usuario.username}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {usuario.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#e6f5ee] px-2 py-1 text-xs font-semibold text-[#07584f]">
                        {usuario.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {typeof usuario.active === 'boolean' ? (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            usuario.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {usuario.active ? 'Activo' : 'Inactivo'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          No disponible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-gray-500"
                    >
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

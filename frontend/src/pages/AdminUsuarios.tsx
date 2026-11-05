import { useEffect, useRef, useState } from 'react';
import {
  Ban,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  Key,
  Loader2,
  MoreVertical,
  Plus,
  UserCheck,
} from 'lucide-react';
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  resetPassword,
  updateUsuario,
} from '../api/usuarios.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useForm } from '../hooks/useForm';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserRole,
} from '../types/user.types';

const userRoles: readonly UserRole[] = [
  'STAFF',
  'DDI',
  'COMITE',
  'EDITOR',
  'ADMIN',
];

const isUserRole = (value: string): value is UserRole =>
  userRoles.some((role) => role === value);

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [createdUsername, setCreatedUsername] = useState('');
  const [passwordAction, setPasswordAction] = useState<'created' | 'reset' | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const { formulario, handleChange, resetForm, setFormulario } = useForm<{
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_author: boolean;
    dni?: string;
    specialtyId?: number | null;
  }>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'STAFF',
    is_author: false,
    dni: '',
    specialtyId: null,
  });

  const resetCreateForm = () => {
    resetForm();
    setModalError('');
    setCreatedPassword(null);
    setCreatedUsername('');
    setPasswordAction(null);
    setIsCopied(false);
    setCopyError('');
  };

  const openCreateModal = () => {
    setEditingUserId(null);
    setShowPermissions(false);
    resetCreateForm();
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormulario({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_author: user.is_author,
      dni: user.dni ?? '',
      specialtyId: user.specialtyId ?? null,
    });
    setEditingUserId(user.id);
    setShowPermissions(false);
    setCreatedPassword(null);
    setCreatedUsername('');
    setPasswordAction(null);
    setModalError('');
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    if (isCreating) return;
    setIsModalOpen(false);
    resetCreateForm();
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value;
    if (isUserRole(role)) {
      setFormulario((current) => ({ ...current, role }));
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModalError('');

    if (
      !formulario.username ||
      !formulario.email ||
      !formulario.first_name ||
      !formulario.last_name
    ) {
      setModalError('Todos los campos son obligatorios');
      return;
    }

    setIsCreating(true);
    try {
      if (editingUserId) {
        await updateUsuario(
          editingUserId,
          formulario as UpdateUserRequest,
        );
        await fetchUsuarios();
        setIsModalOpen(false);
        resetCreateForm();
        return;
      }

      const response = await createUsuario(
        formulario as unknown as CreateUserRequest,
      );
      await fetchUsuarios();
      setCreatedUsername(response.usuario.username || formulario.username);
      setCreatedPassword(response.tempPassword || 'Revisar sistema');
      setPasswordAction('created');
    } catch (err: unknown) {
      setModalError(
        err instanceof Error ? err.message : 'Error en la operación',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!createdPassword) return;

    setCopyError('');
    try {
      await navigator.clipboard.writeText(createdPassword);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setCopyError(
        'No se pudo copiar. Selecciona la contraseña y cópiala manualmente.',
      );
    }
  };

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar usuarios',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsuarios();
  }, []);

  useEffect(() => {
    if (openMenuId === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  const handleSuspend = async (id: number) => {
    if (!window.confirm('¿Suspender esta cuenta?')) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setBusyUserId(id);
    try {
      await updateUsuario(id, { active: false });
      setUsuarios((current) =>
        current.map((usuario) =>
          usuario.id === id ? { ...usuario, active: false } : usuario,
        ),
      );
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : 'Error al suspender usuario',
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleReactivate = async (id: number) => {
    if (!window.confirm('¿Reactivar esta cuenta?')) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setBusyUserId(id);
    try {
      await updateUsuario(id, { active: true });
      setUsuarios((current) =>
        current.map((usuario) =>
          usuario.id === id ? { ...usuario, active: true } : usuario,
        ),
      );
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : 'Error al reactivar usuario',
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('¿Generar nueva contraseña?')) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setBusyUserId(id);
    try {
      const newPassword = await resetPassword(id);
      const usuario = usuarios.find((item) => item.id === id);
      setCreatedUsername(usuario?.username ?? '');
      setCreatedPassword(newPassword);
      setPasswordAction('reset');
      setEditingUserId(null);
      setIsCopied(false);
      setCopyError('');
      setIsModalOpen(true);
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al reiniciar la contraseña',
      );
    } finally {
      setBusyUserId(null);
    }
  };

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
          onClick={openCreateModal}
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
                    Rol / Autor
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => {
                  const isNearBottom = index >= usuarios.length - 2;

                  return (
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
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="rounded-full bg-[#e6f5ee] px-2 py-1 text-xs font-semibold text-[#07584f]">
                            {usuario.role}
                          </span>
                          {usuario.is_author && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                              Autor
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            usuario.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {usuario.active ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="relative px-4 py-3 text-right">
                        <div
                          className="relative inline-block"
                          ref={openMenuId === usuario.id ? menuRef : null}
                        >
                          <button
                            type="button"
                            aria-label={`Acciones para ${usuario.first_name} ${usuario.last_name}`}
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === usuario.id}
                            disabled={busyUserId === usuario.id}
                            onClick={() => {
                              setOpenMenuId((current) =>
                                current === usuario.id ? null : usuario.id,
                              );
                            }}
                            className="rounded-md border border-[#cfe4dc] bg-[#e6f5ee] p-1.5 text-[#087d70] transition-colors hover:bg-[#d5eee4] hover:text-[#07584f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087d70] focus-visible:ring-offset-2 disabled:opacity-50"
                          >
                            {busyUserId === usuario.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <MoreVertical className="h-5 w-5" />
                            )}
                          </button>
                          {openMenuId === usuario.id && (
                            <div
                              role="menu"
                              className={`absolute right-8 z-10 w-56 rounded-md border border-gray-200 bg-white py-1 text-left shadow-lg ${
                                isNearBottom
                                  ? 'bottom-full mb-2'
                                  : 'top-full mt-2'
                              }`}
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => openEditModal(usuario)}
                                className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                                Editar
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => void handleResetPassword(usuario.id)}
                                className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Key className="h-4 w-4 text-blue-500" />
                                Reiniciar contraseña
                              </button>
                              {usuario.active ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => void handleSuspend(usuario.id)}
                                  className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Ban className="h-4 w-4" />
                                  Suspender cuenta
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => void handleReactivate(usuario.id)}
                                  className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Reactivar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          createdPassword
            ? passwordAction === 'reset'
              ? 'Contraseña reiniciada'
              : '¡Usuario Creado!'
            : editingUserId
              ? 'Editar Usuario'
              : 'Registrar Nuevo Usuario'
        }
      >
        {createdPassword ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-600">
              {passwordAction === 'reset' ? 'Nueva contraseña para' : 'El usuario'}{' '}
              <strong className="text-gray-900">{createdUsername}</strong>
              {passwordAction === 'reset' ? '.' : ' fue creado correctamente.'}
            </p>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-left">
              <label htmlFor="temporary-password" className="text-xs font-semibold uppercase text-gray-500">
                Contraseña temporal
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="temporary-password"
                  type="text"
                  readOnly
                  value={createdPassword}
                  onFocus={(event) => event.currentTarget.select()}
                  className="min-w-0 flex-1 select-all rounded border border-gray-300 bg-white px-2 py-1.5 font-mono text-sm text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => void handleCopyPassword()}
                  aria-label={
                    isCopied ? 'Contraseña copiada' : 'Copiar contraseña'
                  }
                  title={isCopied ? 'Copiada' : 'Copiar contraseña'}
                  className="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {copyError && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {copyError}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Guarda o comparte esta contraseña de forma segura. No se volverá a mostrar.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={closeModal}
              className="mt-2 w-full"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                name="first_name"
                value={formulario.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
              <Input
                label="Apellido"
                name="last_name"
                value={formulario.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>

            <Input
              label="DNI"
              name="dni"
              value={formulario.dni ?? ''}
              onChange={handleChange}
            />

            <Input
              label="Nombre de Usuario"
              name="username"
              value={formulario.username}
              onChange={handleChange}
              placeholder="ej: jperez"
              autoComplete="username"
              required
            />

            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formulario.email}
              onChange={handleChange}
              placeholder="correo@hief.gob.ar"
              autoComplete="email"
              required
            />

            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="user-role" className="text-sm font-medium text-gray-700">
                Rol del Sistema
              </label>
              <select
                id="user-role"
                name="role"
                value={formulario.role}
                onChange={handleRoleChange}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#087d70] focus:outline-none focus:ring-2 focus:ring-[#bce8d8]"
              >
                <option value="STAFF">Staff (Médico/Profesional)</option>
                <option value="COMITE">Miembro del Comité</option>
                <option value="DDI">Docencia e Investigación</option>
                <option value="EDITOR">Editor de Publicación</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
              <button
                type="button"
                aria-expanded={showPermissions}
                aria-controls="user-permissions"
                onClick={() => setShowPermissions((open) => !open)}
                className="flex w-full items-center justify-between bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">
                  Permisos Especiales
                </span>
                {showPermissions ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {showPermissions && (
                <div
                  id="user-permissions"
                  className="border-t border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="is_author"
                      name="is_author"
                      checked={formulario.is_author}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 cursor-pointer rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <label
                        htmlFor="is_author"
                        className="cursor-pointer text-sm font-medium text-gray-700"
                      >
                        Permitir publicaciones de documentos
                      </label>
                      <p className="text-xs text-gray-500">
                        Habilita al usuario para enviar manuscritos como autor.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Se generará una contraseña temporal automáticamente. El usuario deberá cambiarla al iniciar sesión.
            </p>

            {modalError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
                {modalError}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeModal} disabled={isCreating}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating}>
                {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

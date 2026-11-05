import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Ban, Key, Loader2, MoreVertical, Plus } from 'lucide-react';
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  resetPassword,
} from '../api/usuarios.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import type { CreateUserRequest, User, UserRole } from '../types/user.types';

const userRoles: readonly UserRole[] = [
  'AUTOR',
  'COMITE',
  'DDI',
  'PUBLISHER',
  'ADMIN',
];

const isUserRole = (value: string): value is UserRole =>
  userRoles.some((role) => role === value);

const initialCreateForm: CreateUserRequest = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  dni: '',
  role: 'AUTOR',
};

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateUserRequest>(initialCreateForm);
  const menuRef = useRef<HTMLDivElement>(null);

  const resetCreateForm = () => {
    setCreateForm(initialCreateForm);
    setModalError('');
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setIsModalOpen(false);
    resetCreateForm();
  };

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value;
    if (isUserRole(role)) {
      setCreateForm((current) => ({ ...current, role }));
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModalError('');

    const payload: CreateUserRequest = {
      ...createForm,
      username: createForm.username.trim(),
      email: createForm.email.trim(),
      first_name: createForm.first_name.trim(),
      last_name: createForm.last_name.trim(),
      dni: createForm.dni?.trim(),
      specialtyId: createForm.specialtyId ?? null,
    };

    if (
      !payload.username ||
      !payload.email ||
      !payload.first_name ||
      !payload.last_name ||
      !payload.dni
    ) {
      setModalError('Completa todos los campos obligatorios.');
      return;
    }

    setIsCreating(true);
    try {
      const { temporaryPassword, ...newUser } = await createUsuario(payload);
      setUsuarios((current) => [newUser, ...current]);
      setActionMessage(
        'Usuario creado correctamente. Deberá cambiar su contraseña al ingresar.',
      );
      window.alert(
        `¡Usuario creado exitosamente!\n\nUsuario: ${newUser.username}\nContraseña temporal: ${temporaryPassword}\n\nComparta estos datos con el usuario de forma segura.`,
      );
      setIsModalOpen(false);
      resetCreateForm();
    } catch (err: unknown) {
      setModalError(
        err instanceof Error ? err.message : 'Error al crear usuario.',
      );
    } finally {
      setIsCreating(false);
    }
  };

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
    if (!window.confirm('¿Estás seguro de suspender esta cuenta?')) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setActionMessage('');
    setBusyUserId(id);
    try {
      await deleteUsuario(id);
      setUsuarios((current) =>
        current.map((usuario) =>
          usuario.id === id ? { ...usuario, active: false } : usuario,
        ),
      );
      setActionMessage('Cuenta suspendida correctamente (simulación).');
    } catch (err: unknown) {
      setActionMessage(
        err instanceof Error ? err.message : 'Error al suspender usuario.',
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('¿Reiniciar la contraseña de este usuario?')) {
      setOpenMenuId(null);
      return;
    }

    setOpenMenuId(null);
    setActionMessage('');
    setBusyUserId(id);
    try {
      await resetPassword(id);
      setActionMessage('Contraseña reiniciada correctamente (simulación).');
    } catch (err: unknown) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : 'Error al reiniciar la contraseña.',
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
          onClick={() => {
            setModalError('');
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {actionMessage && (
          <p
            className="mb-4 rounded-md border border-[#cfe4dc] bg-[#e6f5ee] p-3 text-sm text-[#07584f]"
            role="status"
          >
            {actionMessage}
          </p>
        )}
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
                    <td className="px-4 py-3 text-gray-600">
                      {usuario.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#e6f5ee] px-2 py-1 text-xs font-semibold text-[#07584f]">
                        {usuario.role}
                      </span>
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
                            setActionMessage('');
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
                              onClick={() =>
                                void handleResetPassword(usuario.id)
                              }
                              className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Key className="h-4 w-4 text-blue-500" />
                              Reiniciar contraseña
                            </button>
                            {usuario.active && (
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => void handleSuspend(usuario.id)}
                                className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Ban className="h-4 w-4" />
                                Suspender cuenta
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
                      colSpan={5}
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
        onClose={closeCreateModal}
        title="Registrar Nuevo Usuario"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              name="first_name"
              value={createForm.first_name}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  first_name: event.target.value,
                }))
              }
              autoComplete="given-name"
              required
            />
            <Input
              label="Apellido"
              name="last_name"
              value={createForm.last_name}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  last_name: event.target.value,
                }))
              }
              autoComplete="family-name"
              required
            />
          </div>
          <Input
            label="DNI"
            name="dni"
            value={createForm.dni ?? ''}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                dni: event.target.value,
              }))
            }
            required
          />
          <Input
            label="Nombre de Usuario"
            name="username"
            value={createForm.username}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            autoComplete="username"
            placeholder="ej: jperez"
            required
          />
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            value={createForm.email}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            autoComplete="email"
            placeholder="correo@hief.gob.ar"
            required
          />
          <div className="flex w-full flex-col gap-1.5">
            <label
              htmlFor="user-role"
              className="text-sm font-medium text-gray-700"
            >
              Rol del Sistema
            </label>
            <select
              id="user-role"
              name="role"
              value={createForm.role}
              onChange={handleRoleChange}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#087d70] focus:outline-none focus:ring-2 focus:ring-[#bce8d8]"
            >
              <option value="AUTOR">Autor</option>
              <option value="COMITE">Miembro del Comité</option>
              <option value="DDI">Docencia e Investigación</option>
              <option value="PUBLISHER">Encargado de Publicación</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Se generará una contraseña temporal automáticamente. El usuario
            deberá cambiarla al iniciar sesión.
          </p>

          {modalError && (
            <div
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
              role="alert"
            >
              {modalError}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={closeCreateModal}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

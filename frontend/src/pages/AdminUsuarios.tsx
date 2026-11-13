import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Search,
  UserCheck,
} from 'lucide-react';
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  resetPassword,
  updateUsuario,
} from '../api/usuarios.api';
import {
  getEspecialidades,
  type Especialidad,
} from '../api/especialidades.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useForm } from '../hooks/useForm';
import { PanelUsuarios } from './PanelUsuarios';
import { getProfileImageUrl } from '../utils/profileImage';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'gestion' | 'solicitudes'>(() =>
    searchParams.get('tab') === 'solicitudes' ? 'solicitudes' : 'gestion',
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [especialidadesError, setEspecialidadesError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'TODOS'>('TODOS');
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

  useEffect(() => {
    setActiveTab(
      searchParams.get('tab') === 'solicitudes' ? 'solicitudes' : 'gestion',
    );
  }, [searchParams]);

  const handlePendingCountChange = useCallback((count: number) => {
    setPendingCount(count);
  }, []);

  const { formulario, handleChange, resetForm, setFormulario } = useForm<{
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_author: boolean;
    is_guest: boolean;
    dni?: string;
    specialtyId?: number | null;
  }>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'STAFF',
    is_author: false,
    is_guest: false,
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

  const selectTab = (tab: 'gestion' | 'solicitudes') => {
    setActiveTab(tab);
    setSearchParams(
      tab === 'solicitudes' ? { tab: 'solicitudes' } : {},
      { replace: true },
    );
  };

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      [
        usuario.first_name,
        usuario.last_name,
        usuario.email,
        usuario.username,
      ].some((value) =>
        (value ?? '').toLocaleLowerCase().includes(normalizedSearchTerm),
      );
    const matchesRole =
      roleFilter === 'TODOS' || usuario.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
      is_guest: user.is_guest ?? false,
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
    let active = true;
    getEspecialidades()
      .then((items) => {
        if (active) setEspecialidades(items);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setEspecialidadesError(
            requestError instanceof Error
              ? requestError.message
              : 'Error al cargar las especialidades',
          );
        }
      });

    return () => {
      active = false;
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
    if (!window.confirm('¿Deshabilitar esta cuenta?')) {
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
        err instanceof Error ? err.message : 'Error al deshabilitar usuario',
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
    if (!window.confirm('¿Generar nueva contraseña temporal para este usuario?')) {
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
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 md:flex-row md:items-end">
        <div className="flex gap-6" role="tablist" aria-label="Administración de usuarios">
          <button
            type="button"
            role="tab"
            id="usuarios-tab"
            aria-selected={activeTab === 'gestion'}
            aria-controls="usuarios-panel"
            onClick={() => selectTab('gestion')}
            className={`border-b-2 pb-3 text-lg font-semibold transition-colors ${
              activeTab === 'gestion'
                ? 'border-[#087d70] text-[#07584f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Gestión de Usuarios
          </button>
          <button
            type="button"
            role="tab"
            id="solicitudes-tab"
            aria-selected={activeTab === 'solicitudes'}
            aria-controls="solicitudes-panel"
            onClick={() => selectTab('solicitudes')}
            className={`flex items-center gap-2 border-b-2 pb-3 text-lg font-semibold transition-colors ${
              activeTab === 'solicitudes'
                ? 'border-[#087d70] text-[#07584f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Solicitudes Pendientes
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              {pendingCount}
            </span>
          </button>
        </div>
        <div
          className={`mb-3 flex flex-wrap items-center gap-3 md:mb-0 ${
            activeTab === 'gestion' ? '' : 'hidden'
          }`}
        >
          <label>
            <span className="sr-only">Filtrar por rol</span>
            <select
              value={roleFilter}
              onChange={(event) => {
                const value = event.target.value;
                setRoleFilter(isUserRole(value) ? value : 'TODOS');
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="STAFF">Staff</option>
              <option value="COMITE">Comité</option>
              <option value="DDI">DDI</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Buscar usuarios"
              className="rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
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
      </div>

      <div
        id="usuarios-panel"
        role="tabpanel"
        aria-labelledby="usuarios-tab"
        hidden={activeTab !== 'gestion'}
      >
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
                    Especialidad
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
                {usuariosFiltrados.map((usuario, index) => {
                  const isNearBottom = index >= usuariosFiltrados.length - 2;
                  const isPendingApproval =
                    !usuario.active && usuario.is_guest && usuario.is_author;
                  const profileImageUrl = getProfileImageUrl(usuario.profile_image);

                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {profileImageUrl ? (
                            <img
                              src={profileImageUrl}
                              alt="Perfil"
                              className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500">
                              {usuario.first_name?.charAt(0)}
                              {usuario.last_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="block font-medium text-gray-800">
                              {usuario.first_name} {usuario.last_name}
                            </span>
                            <span className="text-xs text-gray-400">
                              @{usuario.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {especialidades.find(
                          (especialidad) =>
                            especialidad.id === usuario.specialtyId,
                        )?.name ?? 'No asignada'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            {usuario.role}
                          </span>
                          {usuario.is_author && (
                            <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              AUTOR
                            </span>
                          )}
                          {usuario.is_guest && (
                            <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                              INVITADO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            usuario.active
                              ? 'bg-green-100 text-green-700'
                              : isPendingApproval
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {usuario.active
                            ? 'Habilitada'
                            : isPendingApproval
                              ? 'Pendiente de aprobación'
                              : 'Deshabilitada'}
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
                            ) : isPendingApproval ? (
                              <span className="block px-4 py-2 text-sm text-amber-800">
                                Pendiente de aprobación
                              </span>
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
                                  Deshabilitar cuenta
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => void handleReactivate(usuario.id)}
                                  className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Habilitar cuenta
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {usuarios.length > 0 && usuariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
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
      </div>

      <div
        id="solicitudes-panel"
        role="tabpanel"
        aria-labelledby="solicitudes-tab"
        hidden={activeTab !== 'solicitudes'}
      >
        <PanelUsuarios
          embedded
          onPendingCountChange={handlePendingCountChange}
        />
      </div>
      {especialidadesError && activeTab === 'gestion' && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {especialidadesError}
        </p>
      )}

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
              required
            />

            <label className="flex w-full flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">
                Especialidad (Opcional)
              </span>
              <select
                name="specialtyId"
                value={formulario.specialtyId ?? ''}
                onChange={(event) =>
                  setFormulario((current) => ({
                    ...current,
                    specialtyId: event.target.value
                      ? Number(event.target.value)
                      : null,
                  }))
                }
                disabled={isCreating || especialidades.length === 0}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#087d70] focus:outline-none focus:ring-2 focus:ring-[#bce8d8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Sin especialidad</option>
                {especialidades.map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>
                    {especialidad.name}
                  </option>
                ))}
              </select>
              {especialidadesError && (
                <span className="text-xs text-red-600">
                  No se pudo cargar la lista de especialidades.
                </span>
              )}
            </label>

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
                  <div className="mt-3 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="is_guest"
                      name="is_guest"
                      checked={formulario.is_guest}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 cursor-pointer rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <label
                        htmlFor="is_guest"
                        className="cursor-pointer text-sm font-medium text-gray-700"
                      >
                        Usuario Invitado (Autoregistrado)
                      </label>
                      <p className="text-xs text-gray-500">
                        Indica que el usuario se registró por su cuenta para una convocatoria.
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

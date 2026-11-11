import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Camera, Edit3, UserRound } from 'lucide-react';
import { changePassword, updateProfile } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { InputPassword } from '../components/ui/InputPassword';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl } from '../utils/profileImage';

type Message = {
  type: 'success' | 'error';
  text: string;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    username: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const startEditing = () => {
    setEditData({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      username: user?.username ?? '',
    });
    setAvatarFile(null);
    setProfileMessage(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (isUpdatingProfile) return;
    setAvatarFile(null);
    setProfileMessage(null);
    setIsEditing(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    if (!allowedAvatarTypes.includes(file.type)) {
      setProfileMessage({
        type: 'error',
        text: 'La imagen debe ser JPG, PNG o WebP.',
      });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setProfileMessage({
        type: 'error',
        text: 'La imagen no puede superar los 5 MB.',
      });
      return;
    }

    setProfileMessage(null);
    setAvatarFile(file);
  };

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage(null);

    const firstName = editData.first_name.trim();
    const lastName = editData.last_name.trim();
    const username = editData.username.trim();
    if (!firstName || !lastName || !username) {
      setProfileMessage({
        type: 'error',
        text: 'Nombre, apellido y nombre de usuario son obligatorios.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('username', username);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateProfile(formData);
      updateUser(updatedUser);
      setAvatarFile(null);
      setIsEditing(false);
      setProfileMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente.',
      });
    } catch (error: unknown) {
      setProfileMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Error al actualizar perfil.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwordData.new !== passwordData.confirm) {
      setPasswordMessage({
        type: 'error',
        text: 'Las contraseñas nuevas no coinciden.',
      });
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.current, passwordData.new);
      setPasswordData({ current: '', new: '', confirm: '' });
      setPasswordMessage({
        type: 'success',
        text: 'Contraseña actualizada correctamente.',
      });
    } catch (error: unknown) {
      setPasswordMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Error al cambiar la contraseña.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const imageUrl = useMemo(
    () =>
      getProfileImageUrl(
        user?.profile_image,
        user?.profile_image ? Date.now() : undefined,
      ),
    [user?.profile_image],
  );
  const previewUrl = avatarPreview || imageUrl;
  const initials = `${user?.first_name?.charAt(0) ?? ''}${user?.last_name?.charAt(0) ?? ''}`;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
          Cuenta personal
        </p>
        <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
          Mi Perfil
        </h2>
        <p className="mt-1 text-[13px] text-[#526e68]">
          Consulta tus datos y administra la seguridad de tu cuenta.
        </p>
      </header>

      {profileMessage && !isEditing && (
        <p
          className={`rounded-md p-3 text-sm ${
            profileMessage.type === 'error'
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-700'
          }`}
          role={profileMessage.type === 'error' ? 'alert' : 'status'}
        >
          {profileMessage.text}
        </p>
      )}

      {isEditing ? (
        <Card title="Editar Mis Datos">
          <form
            onSubmit={handleUpdateProfile}
            className="flex flex-col gap-4"
          >
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isUpdatingProfile}
              className="flex items-center gap-1 self-start text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la vista de perfil
            </button>

            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vista previa de la foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUpdatingProfile}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingProfile}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Cambiar foto
                </Button>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG o WebP. Máximo 5 MB.
                </p>
                {avatarFile && (
                  <p className="mt-1 max-w-xs truncate text-xs text-gray-600">
                    {avatarFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                name="first_name"
                autoComplete="given-name"
                value={editData.first_name}
                onChange={(event) =>
                  setEditData((current) => ({
                    ...current,
                    first_name: event.target.value,
                  }))
                }
                disabled={isUpdatingProfile}
                required
              />
              <Input
                label="Apellido"
                name="last_name"
                autoComplete="family-name"
                value={editData.last_name}
                onChange={(event) =>
                  setEditData((current) => ({
                    ...current,
                    last_name: event.target.value,
                  }))
                }
                disabled={isUpdatingProfile}
                required
              />
            </div>
            <Input
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              value={editData.username}
              onChange={(event) =>
                setEditData((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              disabled={isUpdatingProfile}
              required
            />
            <Input
              label="Correo electrónico (no editable)"
              value={user?.email ?? ''}
              disabled
              className="bg-gray-50 text-gray-500"
            />

            {profileMessage && (
              <p
                className={`rounded-md p-3 text-sm ${
                  profileMessage.type === 'error'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-700'
                }`}
                role={profileMessage.type === 'error' ? 'alert' : 'status'}
              >
                {profileMessage.text}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={cancelEditing}
                disabled={isUpdatingProfile}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingProfile}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center py-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Foto de perfil"
                className="mb-4 h-32 w-32 rounded-full border-4 border-[#d7f2e6] object-cover"
              />
            ) : (
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-[#087d70] text-3xl font-bold text-white">
                {initials || <UserRound className="h-12 w-12" />}
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-800">
              {user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuario'}
            </h3>
            <p className="mb-2 text-gray-500">@{user?.username}</p>
            {user?.role && (
              <span className="mb-6 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                Rol: {user.role}
              </span>
            )}

            <dl className="w-full max-w-md space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-gray-500">Correo</dt>
                <dd className="break-all text-right">{user?.email ?? 'No disponible'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-gray-500">Estado</dt>
                <dd className={user?.active ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                  {user?.active ? 'Activo' : 'Suspendido'}
                </dd>
              </div>
            </dl>

            <Button
              type="button"
              onClick={startEditing}
              variant="primary"
              className="mt-6 flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        </Card>
      )}

      <Card title="Seguridad">
        <form
          onSubmit={handleChangePassword}
          className="flex flex-col gap-4"
        >
          <p className="mb-2 text-sm text-gray-500">
            Cambia tu contraseña regularmente para mantener tu cuenta segura.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputPassword
              label="Contraseña actual"
              name="current"
              autoComplete="current-password"
              value={passwordData.current}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  current: event.target.value,
                }))
              }
              disabled={isChangingPassword}
              required
            />
            <InputPassword
              label="Nueva contraseña"
              name="new"
              autoComplete="new-password"
              value={passwordData.new}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  new: event.target.value,
                }))
              }
              disabled={isChangingPassword}
              minLength={6}
              required
            />
            <InputPassword
              label="Confirmar contraseña"
              name="confirm"
              autoComplete="new-password"
              value={passwordData.confirm}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  confirm: event.target.value,
                }))
              }
              disabled={isChangingPassword}
              minLength={6}
              required
            />
          </div>

          {passwordMessage && (
            <p
              className={`rounded-md p-3 text-sm ${
                passwordMessage.type === 'error'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-700'
              }`}
              role={passwordMessage.type === 'error' ? 'alert' : 'status'}
            >
              {passwordMessage.text}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isChangingPassword}
            className="self-start"
          >
            Actualizar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
};

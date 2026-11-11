import { useEffect, useState, type FormEvent } from 'react';
import { Camera, UserRound } from 'lucide-react';
import { changePassword, updateProfile } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { InputPassword } from '../components/ui/InputPassword';
import { useAuth } from '../context/AuthContext';

type Message = {
  type: 'success' | 'error';
  text: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const resolveImageUrl = (image: string): string => {
  try {
    return new URL(image, apiBaseUrl).toString();
  } catch {
    return image;
  }
};

export const Perfil = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    username: user?.username ?? '',
    profile_image: user?.profile_image ?? '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  const [passwordData, setPasswordData] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfileData({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      profile_image: user.profile_image ?? '',
    });
  }, [user]);

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage(null);

    const updatedProfile = {
      first_name: profileData.first_name.trim(),
      last_name: profileData.last_name.trim(),
      username: profileData.username.trim(),
      profile_image: profileData.profile_image.trim() || null,
    };
    if (
      !updatedProfile.first_name ||
      !updatedProfile.last_name ||
      !updatedProfile.username
    ) {
      setProfileMessage({
        type: 'error',
        text: 'Nombre, apellido y nombre de usuario son obligatorios.',
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateProfile(updatedProfile);
      login(updatedUser);
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

    if (passwordData.next !== passwordData.confirm) {
      setPasswordMessage({
        type: 'error',
        text: 'Las contraseñas nuevas no coinciden.',
      });
      return;
    }
    if (passwordData.next.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.current, passwordData.next);
      setPasswordData({ current: '', next: '', confirm: '' });
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

  const profileImageSrc = profileData.profile_image.trim()
    ? resolveImageUrl(profileData.profile_image.trim())
    : '';

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
          Administra tus datos personales y la seguridad de tu cuenta.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <Card title="Mis Datos Personales" className="h-full">
          <form
            onSubmit={handleUpdateProfile}
            className="flex flex-col gap-4"
          >
            <div className="mb-2 flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                {profileImageSrc ? (
                  <img
                    src={profileImageSrc}
                    alt={`Foto de perfil de ${profileData.first_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Camera className="h-4 w-4" />
                Foto mediante URL
              </div>
            </div>

            <Input
              label="URL de imagen de perfil"
              type="url"
              name="profile_image"
              placeholder="https://ejemplo.com/foto.jpg"
              value={profileData.profile_image}
              onChange={(event) =>
                setProfileData((current) => ({
                  ...current,
                  profile_image: event.target.value,
                }))
              }
              disabled={isUpdatingProfile}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                name="first_name"
                autoComplete="given-name"
                value={profileData.first_name}
                onChange={(event) =>
                  setProfileData((current) => ({
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
                value={profileData.last_name}
                onChange={(event) =>
                  setProfileData((current) => ({
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
              value={profileData.username}
              onChange={(event) =>
                setProfileData((current) => ({
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

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingProfile}
            >
              Guardar cambios
            </Button>
          </form>
        </Card>

        <Card title="Seguridad" className="h-full">
          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4"
          >
            <p className="mb-2 text-sm text-gray-500">
              Si tienes una contraseña temporal, cámbiala aquí.
            </p>

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
              name="next"
              autoComplete="new-password"
              value={passwordData.next}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  next: event.target.value,
                }))
              }
              disabled={isChangingPassword}
              minLength={6}
              required
            />
            <InputPassword
              label="Confirmar nueva contraseña"
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
            >
              Actualizar contraseña
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

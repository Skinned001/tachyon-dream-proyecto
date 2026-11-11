import { useState, type FormEvent } from 'react';
import { KeyRound, UserRound } from 'lucide-react';
import { changePassword } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';

export const Perfil = () => {
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { formulario, handleChange, resetForm } = useForm({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (formulario.newPassword !== formulario.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (formulario.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(formulario.currentPassword, formulario.newPassword);
      setSuccess('Contraseña actualizada correctamente.');
      resetForm();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Error al cambiar la contraseña',
      );
    } finally {
      setIsChanging(false);
    }
  };

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mis Datos" className="h-full">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#d7f2e6] text-[#087366]">
              <UserRound className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuario'}
            </h3>
            {user?.username && (
              <p className="text-sm text-gray-500">@{user.username}</p>
            )}
            {user?.role && (
              <span className="mt-2 rounded-full bg-[#e6f5ee] px-3 py-1 text-xs font-semibold text-[#07584f]">
                Rol: {user.role}
              </span>
            )}
          </div>

          <dl className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-500">Correo</dt>
              <dd className="break-all text-right">{user?.email || 'No disponible'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-500">Especialidad</dt>
              <dd>{user?.specialtyId ?? 'No asignada'}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Seguridad" className="h-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="mb-2 flex items-center gap-2 text-gray-700">
              <KeyRound className="h-5 w-5 text-[#087366]" />
              <p className="text-sm">Actualiza la contraseña de tu cuenta.</p>
            </div>

            <Input
              label="Contraseña actual"
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              value={formulario.currentPassword}
              onChange={handleChange}
              disabled={isChanging}
              required
            />
            <Input
              label="Nueva contraseña"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              value={formulario.newPassword}
              onChange={handleChange}
              disabled={isChanging}
              minLength={6}
              required
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formulario.confirmPassword}
              onChange={handleChange}
              disabled={isChanging}
              minLength={6}
              required
            />

            {error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">
                {success}
              </p>
            )}

            <Button type="submit" variant="primary" isLoading={isChanging} className="mt-2">
              Actualizar contraseña
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

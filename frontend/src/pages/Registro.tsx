import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useForm } from '../hooks/useForm';

export const Registro = () => {
  const navigate = useNavigate();
  const { formulario, handleChange } = useForm<{
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    dni: string;
  }>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    dni: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const message = await register(formulario);
      setSuccessMessage(message);
      setIsSuccess(true);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error al registrar usuario.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f2f7f4] px-5 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-[#d5e6df] bg-white p-6 shadow-sm sm:p-9">
        <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-[#52766d]">
          Chief Journal
        </p>
        <h1 className="font-editorial mt-2 text-3xl tracking-[-.03em] text-[#173d3b]">
          Registro de invitado
        </h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-[#526e68]">
          Crea una cuenta para participar en las convocatorias de investigación.
        </p>

        {isSuccess ? (
          <div
            className="rounded-lg border border-green-200 bg-green-50 p-6 text-center"
            role="status"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-green-800">
              ¡Registro exitoso!
            </h2>
            <p className="text-sm leading-6 text-green-700">
              {successMessage ||
                'Tu cuenta fue creada y está pendiente de aprobación. Un administrador debe habilitarla antes de que puedas ingresar.'}
            </p>
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 w-full"
              variant="primary"
            >
              Volver al Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                name="first_name"
                autoComplete="given-name"
                value={formulario.first_name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Apellido"
                name="last_name"
                autoComplete="family-name"
                value={formulario.last_name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            <Input
              label="DNI"
              name="dni"
              autoComplete="off"
              value={formulario.dni}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              value={formulario.username}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              value={formulario.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formulario.password}
              onChange={handleChange}
              disabled={isSubmitting}
              minLength={8}
              maxLength={72}
              required
            />

            {error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
            >
              Crear cuenta
            </Button>
          </form>
        )}
      </section>
    </main>
  );
};

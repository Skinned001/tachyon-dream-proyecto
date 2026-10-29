import { useState, type FormEvent } from 'react';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth.api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const { formulario, handleChange } = useForm({
    email: '',
    password: '',
  });

  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formulario.email || !formulario.password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = await loginApi(formulario.email, formulario.password);
      login(userData);
      window.location.href = '/';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-institucional-700">
            Portal Científico Evita
          </h1>
          <p className="text-gray-500 mt-2">La Voz de la Ciencia</p>
        </div>

        <Card title="Iniciar Sesión">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@hief.gob.ar"
              value={formulario.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formulario.password}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="mt-2 w-full"
            >
              Ingresar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

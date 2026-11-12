import { useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowLeft,
  Check,
  Fingerprint,
  Info,
  LockKeyhole,
  Mail,
  MessageSquare,
  UploadCloud,
  User,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { useForm } from '../hooks/useForm';

type RegistrationFormData = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  dni: string;
};

const initialFormData: RegistrationFormData = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  dni: '',
};

const inputClassName =
  'h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-4 text-[13px] text-[#173d3b] outline-none transition placeholder:text-[#7b958c] focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70 disabled:cursor-not-allowed disabled:opacity-60';

export const Registro = () => {
  const { formulario, handleChange } =
    useForm<RegistrationFormData>(initialFormData);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credencial, setCredencial] = useState<File | null>(null);
  const [comentarios, setComentarios] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // La API deberá aceptar FormData para incluir la documentación y los comentarios.
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
    <main className="grid min-h-[100dvh] bg-[#f2f7f4] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#087366] px-[8%] py-12 text-[#f3fffa] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[570px] w-[570px] rounded-full border border-[#a8ead5]/25" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-[330px] w-[330px] rounded-full border border-[#a8ead5]/30" />
        <div className="pointer-events-none absolute bottom-[-260px] left-[-170px] h-[560px] w-[560px] rounded-full border border-[#a8ead5]/20" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a8ead5]/40 bg-[#effff8]/15">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[.12em]">HOSPITAL EVITA</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-[#c7f0df]">
              Universitario
            </p>
          </div>
        </div>

        <div className="relative max-w-[540px] pb-10">
          <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#d0f2e3]">
            <span className="h-px w-7 bg-[#b3e8d3]" />
            Chief Journal
          </p>
          <h1 className="font-editorial text-[clamp(44px,5vw,72px)] leading-[.98] tracking-[-.04em]">
            La ciencia
            <br />
            <i className="font-medium text-[#c0f2df]">
              al servicio de la comunidad.
            </i>
          </h1>
          <p className="mt-7 max-w-[420px] text-[14px] leading-7 text-[#e0f4eb]">
            Únete a nuestra red de investigadores, comparte tu conocimiento y
            contribuye al avance de la medicina en Formosa.
          </p>
        </div>

        <div className="relative flex items-end justify-between border-t border-[#b3e8d3]/30 pt-5 text-[10px] text-[#d0f2e3]">
          <span>Producción científica · Investigación</span>
          <span className="font-data">HIEF</span>
        </div>
      </section>

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto px-6 py-24 sm:px-12 lg:px-16">
        <div className="w-full max-w-[500px] py-8 page-enter">
          <div className="mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64877c] transition hover:text-[#173d3b]"
            >
              <ArrowLeft size={18} />
              Volver al portal
            </Link>
          </div>

          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087d70] text-[#f4fffb]">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[.12em] text-[#173d3b]">
                HOSPITAL EVITA
              </p>
              <p className="text-[10px] uppercase tracking-[.15em] text-[#52766d]">
                Chief Journal
              </p>
            </div>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-[#52766d]">
            Espacio de investigación
          </p>
          <h2 className="font-editorial mt-3 text-[36px] leading-tight tracking-[-.035em] text-[#173d3b]">
            Solicitud de acceso.
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[#526e68]">
            Crea una cuenta para participar como autor en las convocatorias de
            investigación.
          </p>

          {isSuccess ? (
            <div
              className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
              role="status"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={22} />
              </div>
              <h3 className="text-base font-semibold text-emerald-900">
                Solicitud enviada
              </h3>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                {successMessage ||
                  'Tu cuenta quedó pendiente de aprobación. Un administrador revisará tu solicitud antes de que puedas ingresar.'}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#087d70] px-5 text-sm font-semibold text-white transition hover:bg-[#07584f] focus:outline-none focus:ring-4 focus:ring-[#bce8d8]/70"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                    Nombre
                  </span>
                  <input
                    required
                    type="text"
                    name="first_name"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    value={formulario.first_name}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                    Apellido
                  </span>
                  <input
                    required
                    type="text"
                    name="last_name"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    value={formulario.last_name}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                  DNI
                </span>
                <span className="relative block">
                  <Fingerprint
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64877c]"
                    size={16}
                  />
                  <input
                    required
                    type="text"
                    name="dni"
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={isSubmitting}
                    value={formulario.dni}
                    onChange={handleChange}
                    className={`${inputClassName} pl-11`}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                  Nombre de usuario
                </span>
                <span className="relative block">
                  <User
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64877c]"
                    size={16}
                  />
                  <input
                    required
                    type="text"
                    name="username"
                    autoComplete="username"
                    disabled={isSubmitting}
                    value={formulario.username}
                    onChange={handleChange}
                    className={`${inputClassName} pl-11`}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                  Correo electrónico
                </span>
                <span className="relative block">
                  <Mail
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64877c]"
                    size={16}
                  />
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={formulario.email}
                    onChange={handleChange}
                    className={`${inputClassName} pl-11`}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                  Contraseña
                </span>
                <span className="relative block">
                  <LockKeyhole
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64877c]"
                    size={16}
                  />
                  <input
                    required
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    disabled={isSubmitting}
                    value={formulario.password}
                    onChange={handleChange}
                    className={`${inputClassName} pl-11`}
                  />
                </span>
                <span className="mt-1.5 block text-[10px] text-[#607c73]">
                  Usa entre 8 y 72 caracteres.
                </span>
              </label>

              <label className="mt-2 block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#45665f]">
                  Documentación respaldatoria (Opcional)
                </span>
                <span className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#cfe4dc] bg-[#f0f6f3] py-5 transition hover:border-[#087d70] hover:bg-[#e6f2ec]">
                  <UploadCloud
                    aria-hidden="true"
                    className="mb-2 text-[#64877c]"
                    size={24}
                  />
                  <span className="text-center text-[11px] font-medium text-[#52766d]">
                    {credencial ? (
                      <span className="font-semibold text-[#087d70]">
                        {credencial.name}
                      </span>
                    ) : (
                      'Sube tu matrícula, diploma o certificado (PDF, JPG, PNG)'
                    )}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    aria-label="Subir documentación respaldatoria"
                    className="sr-only"
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setCredencial(event.target.files?.[0] ?? null)
                    }
                  />
                </span>
              </label>

              <label className="relative block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#45665f]">
                  Comentarios adicionales (Opcional)
                </span>
                <span className="relative block">
                  <MessageSquare
                    aria-hidden="true"
                    className="absolute left-4 top-4 text-[#64877c]"
                    size={16}
                  />
                  <textarea
                    rows={2}
                    placeholder="Ej: Soy residente de 3er año en el Instituto..."
                    value={comentarios}
                    disabled={isSubmitting}
                    onChange={(event) => setComentarios(event.target.value)}
                    className="w-full rounded-xl border border-[#cfe4dc] bg-[#f0f6f3] py-3 pl-11 pr-4 text-[13px] text-[#173d3b] outline-none transition placeholder:text-[#7b958c] focus:border-[#087d70] focus:bg-white focus:ring-2 focus:ring-[#087d70]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </span>
              </label>

              <div className="flex items-start gap-3 rounded-xl border border-[#cfe4dc] bg-[#e6f5ee] p-4">
                <Info
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#087366]"
                  size={16}
                />
                <p className="text-[11px] leading-5 text-[#42685e]">
                  <strong>Proceso de validación:</strong> la solicitud quedará
                  pendiente hasta que un administrador la revise y habilite la
                  cuenta.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087d70] text-[13px] font-semibold text-white transition hover:bg-[#07584f] focus:outline-none focus:ring-4 focus:ring-[#bce8d8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Enviando solicitud…' : 'Enviar solicitud'}
                {!isSubmitting && (
                  <UserPlus
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[10px] text-[#607c73]">
            © {new Date().getFullYear()} Hospital Interdistrital Evita
          </p>
        </div>
      </section>
    </main>
  );
};

import { useState, type FormEvent } from 'react';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    
    if (!email.trim() || !password) { 
      setError('Ingresa tu correo institucional y clave para continuar.'); 
      return; 
    }
    
    try {
      // Llamada real al backend HIEF
      const response = await axiosClient.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        navigate((location.state as { from?: string } | null)?.from || '/', { replace: true });
      } else {
        setError('Credenciales inválidas.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor.');
    }
  }

  return (
    <main className="grid min-h-[100dvh] bg-[#f2f7f4] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#087366] px-[8%] py-12 text-[#f3fffa] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-[570px] w-[570px] rounded-full border border-[#a8ead5]/25" />
        <div className="absolute -right-12 -top-12 h-[330px] w-[330px] rounded-full border border-[#a8ead5]/30" />
        <div className="absolute bottom-[-260px] left-[-170px] h-[560px] w-[560px] rounded-full border border-[#a8ead5]/20" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a8ead5]/40 bg-[#effff8]/15">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[.12em]">HOSPITAL EVITA</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-[#c7f0df]">Universitario</p>
          </div>
        </div>
        <div className="relative max-w-[540px] pb-10">
          <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#d0f2e3]">
            <span className="h-px w-7 bg-[#b3e8d3]" />Chief Journal
          </p>
          <h1 className="font-editorial text-[clamp(44px,5vw,72px)] leading-[.98] tracking-[-.04em]">
            La evidencia<br /><i className="font-medium text-[#c0f2df]">mejora la atención.</i>
          </h1>
          <p className="mt-7 max-w-[420px] text-[14px] leading-7 text-[#e0f4eb]">
            Un espacio compartido para investigar, generar conocimiento y contribuir a una mejor atención de salud en Formosa.
          </p>
        </div>
        <div className="relative flex items-end justify-between border-t border-[#b3e8d3]/30 pt-5 text-[10px] text-[#d0f2e3]">
          <span>Producción científica · Investigación</span>
          <span className="font-data">HIEF</span>
        </div>
      </section>
      
      <section className="flex min-h-[100dvh] items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px] page-enter">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087d70] text-[#f4fffb]">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[.12em] text-[#173d3b]">HOSPITAL EVITA</p>
              <p className="text-[10px] uppercase tracking-[.15em] text-[#52766d]">Chief Journal</p>
            </div>
          </div>
          
          <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-[#52766d]">Espacio de investigación</p>
          <h2 className="font-editorial mt-3 text-[42px] leading-tight tracking-[-.035em] text-[#173d3b]">Te damos la bienvenida.</h2>
          <p className="mt-2 text-[13px] leading-6 text-[#526e68]">Ingresa con tus credenciales institucionales.</p>
           
          <form onSubmit={submit} className="mt-9 space-y-5">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">Correo institucional</span>
              <input 
                type="email" 
                autoComplete="username" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="autor@hief.gob.ar" 
                className="h-12 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70" 
              />
            </label>
            
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">Contraseña</span>
              <span className="relative block">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="current-password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Hief2026*" 
                  className="h-12 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-4 pr-12 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52766d] hover:text-[#07584f]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            
            {error && <p role="alert" className="text-xs text-[#a3342d]">{error}</p>}
            
            <button 
              type="submit" 
              className="group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087d70] text-[13px] font-semibold text-white transition hover:bg-[#07584f] focus:outline-none focus:ring-4 focus:ring-[#bce8d8]"
            >
              Iniciar sesión <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
           
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#cfe4dc] bg-[#e6f5ee] p-4">
            <LockKeyhole size={16} className="mt-0.5 shrink-0 text-[#087366]" />
            <p className="text-[10px] leading-5 text-[#42685e]">Utiliza las credenciales de prueba proporcionadas (ej. admin@hief.gob.ar / Hief2026*).</p>
          </div>
          <p className="mt-9 text-center text-[10px] text-[#607c73]">© 2026 Hospital Interdistrital Evita</p>
        </div>
      </section>
    </main>
  );
}

export { Login };
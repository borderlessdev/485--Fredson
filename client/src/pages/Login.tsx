import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { login, register } from '@/services/auth';
import { AxiosError } from 'axios';

// ─── Icons ───────────────────────────────────────────────────────────────────
function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ─── Schemas ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter um número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-400'];
  const labels = ['', 'Fraca', 'Média', 'Boa', 'Forte'];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="text-[11px] text-slate-400">{labels[score]}</p>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const watchedPassword = registerForm.watch('password', '');

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setApiError('');
    loginForm.reset();
    registerForm.reset();
  }

  async function handleLogin(data: LoginForm) {
    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await login(data);
      signIn(res.token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setApiError(e.response?.data?.error ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(data: RegisterForm) {
    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await register(data);
      signIn(res.token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setApiError(e.response?.data?.error ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left: Brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 40%, #06b6d4 100%)' }}>

        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
        {/* Glow orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full bg-cyan-300/20 blur-[80px]" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-teal-300/20 blur-[60px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white text-2xl font-extrabold tracking-tight">485</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gerencie seus<br />projetos com<br />eficiência.
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Plataforma completa para gestão de clientes, projetos e documentos — tudo em um único lugar.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-3">
          {[
            { value: '1.200+', label: 'Projetos gerenciados' },
            { value: '300+',   label: 'Clientes atendidos'  },
            { value: '99.9%',  label: 'Uptime garantido'    },
            { value: '8.000+', label: 'Documentos gerados'  },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-[380px] animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">485</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>
          <p className="text-slate-500 text-sm mb-7">
            {mode === 'login'
              ? 'Bem-vindo de volta! Digite suas credenciais.'
              : 'Preencha os dados abaixo para começar.'}
          </p>

          {/* API Error */}
          {apiError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
              {apiError}
            </div>
          )}

          {/* ── Login form ────────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  className="input-field"
                />
                {loginForm.formState.errors.email && (
                  <p className="error-text">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <IconEye open={showPassword} />
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="error-text">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          )}

          {/* ── Register form ─────────────────────────────────────── */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  placeholder="Seu nome"
                  autoComplete="name"
                  className="input-field"
                />
                {registerForm.formState.errors.name && (
                  <p className="error-text">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  className="input-field"
                />
                {registerForm.formState.errors.email && (
                  <p className="error-text">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <IconEye open={showPassword} />
                  </button>
                </div>
                <PasswordStrength password={watchedPassword} />
                {registerForm.formState.errors.password && (
                  <p className="error-text">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <input
                    {...registerForm.register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <IconEye open={showConfirm} />
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="error-text">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Cadastrando...
                  </span>
                ) : 'Criar conta'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Mode toggle */}
          <p className="text-center text-sm text-slate-500">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

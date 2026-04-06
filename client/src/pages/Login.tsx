import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { login, register } from '@/services/auth';
import { AxiosError } from 'axios';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
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
function IconBolt() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
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

// ─── Password strength bar ────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const data = [
    { label: '', bar: '' },
    { label: 'Fraca',  bar: 'bg-rose-500'  },
    { label: 'Média',  bar: 'bg-amber-400' },
    { label: 'Boa',    bar: 'bg-sky-400'   },
    { label: 'Forte',  bar: 'bg-emerald-400' },
  ];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? data[score].bar : 'bg-white/10'}`} />
        ))}
      </div>
      <p className="text-[11px] text-white/40">{data[score].label}</p>
    </div>
  );
}

// ─── Reusable input with leading icon ────────────────────────────────────────
function Field({
  icon,
  error,
  children,
}: {
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className={`flex items-center gap-3 bg-white/[0.05] border rounded-xl px-4 py-3 transition-all duration-200 hover:border-white/20 focus-within:border-violet-500/70 focus-within:bg-white/[0.07] ${error ? 'border-rose-500/50' : 'border-white/10'}`}>
        <span className="text-white/30 shrink-0">{icon}</span>
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-400">
          <IconAlert />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [mode, setMode]               = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [apiError, setApiError]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn }  = useAuth();
  const navigate    = useNavigate();

  const loginForm    = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
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

  const inputBase =
    'flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none min-w-0';

  return (
    <div className="min-h-screen bg-[#07091280] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 20%, #1a1040 0%, #060812 55%, #0a0d1a 100%)' }}
    >
      {/* ── Aurora blobs ───────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%]  w-[500px] h-[500px] rounded-full bg-violet-700/20  blur-[110px]" />
        <div className="absolute bottom-[-5%] left-[-5%]  w-[600px] h-[400px] rounded-full bg-indigo-700/15 blur-[130px]" />
        <div className="absolute top-[45%] left-[30%]   w-[300px] h-[300px] rounded-full bg-cyan-600/10   blur-[90px]" />
      </div>

      {/* ── Dot-grid overlay ────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Card ────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[420px] animate-slide-up">
        {/* top gradient accent bar */}
        <div className="h-[2px] rounded-t-2xl bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400 shadow-[0_0_20px_rgba(139,92,246,0.5)]" />

        <div className="rounded-b-2xl border border-t-0 border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">

          {/* ── Brand ────────────────────────────────────────────── */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-700/40">
              <IconBolt />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.25em] text-violet-400 uppercase">Plataforma</p>
              <p className="text-[17px] font-extrabold text-white leading-tight tracking-tight">
                485 <span className="text-white/30 font-light">Pro</span>
              </p>
            </div>
          </div>

          {/* ── Title ────────────────────────────────────────────── */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
            </h2>
            <p className="text-sm text-white/40 mt-1">
              {mode === 'login'
                ? 'Acesse seu painel e acompanhe tudo em tempo real.'
                : 'Preencha os dados abaixo para começar.'}
            </p>
          </div>

          {/* ── API Error ────────────────────────────────────────── */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 animate-fade-in">
              <span className="text-rose-400 mt-0.5"><IconAlert /></span>
              <p className="text-rose-400 text-sm">{apiError}</p>
            </div>
          )}

          {/* ══════════ LOGIN FORM ══════════════════════════════════ */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3.5" noValidate>
              <Field icon={<IconMail />} error={loginForm.formState.errors.email?.message}>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="usuario@email.com"
                  autoComplete="email"
                  className={inputBase}
                />
              </Field>

              <Field icon={<IconLock />} error={loginForm.formState.errors.password?.message}>
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputBase}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-white/25 hover:text-white/60 transition-colors shrink-0"
                >
                  <IconEye open={showPassword} />
                </button>
              </Field>

              <div className="flex justify-end pt-0.5">
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-3 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-violet-600 to-indigo-600
                           hover:from-violet-500 hover:to-indigo-500
                           active:from-violet-700 active:to-indigo-700
                           shadow-lg shadow-violet-700/30
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  'ENTRAR'
                )}
              </button>
            </form>
          )}

          {/* ══════════ REGISTER FORM ═══════════════════════════════ */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3.5" noValidate>
              <Field icon={<IconUser />} error={registerForm.formState.errors.name?.message}>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  className={inputBase}
                />
              </Field>

              <Field icon={<IconMail />} error={registerForm.formState.errors.email?.message}>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="usuario@email.com"
                  autoComplete="email"
                  className={inputBase}
                />
              </Field>

              <div>
                <Field icon={<IconLock />} error={registerForm.formState.errors.password?.message}>
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-white/25 hover:text-white/60 transition-colors shrink-0"
                  >
                    <IconEye open={showPassword} />
                  </button>
                </Field>
                <PasswordStrength password={watchedPassword} />
              </div>

              <Field icon={<IconLock />} error={registerForm.formState.errors.confirmPassword?.message}>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirme a senha"
                  autoComplete="new-password"
                  className={inputBase}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-white/25 hover:text-white/60 transition-colors shrink-0"
                >
                  <IconEye open={showConfirm} />
                </button>
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-3 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-violet-600 to-indigo-600
                           hover:from-violet-500 hover:to-indigo-500
                           active:from-violet-700 active:to-indigo-700
                           shadow-lg shadow-violet-700/30
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Cadastrando...
                  </span>
                ) : (
                  'CRIAR CONTA'
                )}
              </button>
            </form>
          )}

          {/* ── divider ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[11px] text-white/20 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* ── mode toggle ──────────────────────────────────────── */}
          <p className="text-center text-sm text-white/35">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

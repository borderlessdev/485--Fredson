import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage, login, register } from '@/services/auth';

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

const PIPELINE = [
  { label: 'Proposta', hint: 'Captação e análise' },
  { label: 'Aprovação', hint: 'Documentos e status' },
  { label: 'Cessão', hint: 'Fechamento da operação' },
];

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
      signIn(res.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(data: RegisterForm) {
    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await register(data);
      signIn(res.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f7fafc]">
      {/* ── Left: Brand panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 xl:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0c4a6e 0%, #0e7490 45%, #0891b2 100%)' }}
      >
        {/* Atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-cyan-300/15 blur-[90px]" />
        <div className="absolute bottom-[-80px] left-[-40px] w-[300px] h-[300px] rounded-full bg-sky-900/40 blur-[70px]" />
        <div className="absolute top-1/2 right-8 w-px h-40 bg-gradient-to-b from-transparent via-white/25 to-transparent" />

        {/* Brand */}
        <div className="relative animate-fade-in">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-sky-950/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-[1.75rem] font-black tracking-tight leading-none font-display">485</p>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-cyan-100/80 uppercase mt-1">Gestão</p>
            </div>
          </div>

          <h1 className="font-display text-[2.75rem] xl:text-[3.15rem] font-bold text-white leading-[1.08] tracking-tight max-w-md">
            Precatórios sob
            <span className="block text-cyan-100/95">controle real.</span>
          </h1>
          <p className="mt-5 text-cyan-50/75 text-[15px] leading-relaxed max-w-sm">
            Da proposta à cessão: acompanhe status, documentos e operações em um fluxo único.
          </p>
        </div>

        {/* Pipeline visual (replaces calendar) */}
        <div className="relative mt-10 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-100/50 mb-4">Fluxo da esteira</p>
          <div className="space-y-0">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full border border-white/30 bg-white/10 text-white text-xs font-bold flex items-center justify-center backdrop-blur-sm">
                    {i + 1}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <span className="w-px flex-1 min-h-[28px] bg-white/20 my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-white text-sm font-semibold leading-none">{step.label}</p>
                  <p className="text-cyan-100/55 text-xs mt-1.5">{step.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foot note */}
        <p className="relative text-[11px] text-cyan-100/45 tracking-wide">
          Ambiente seguro · Acesso restrito à equipe autorizada
        </p>
      </div>

      {/* ── Right: Form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#f7fafc]">
        <div className="w-full max-w-[400px] animate-slide-up">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] p-7 sm:p-8">

            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-7 lg:hidden">
              <div className="w-9 h-9 bg-cyan-700 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black text-slate-900 font-display tracking-tight">485</span>
            </div>

            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-cyan-700 mb-2">
              {mode === 'login' ? 'Acesso' : 'Cadastro'}
            </p>
            <h2 className="font-display text-[1.65rem] font-bold text-slate-900 tracking-tight mb-1">
              {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
            </h2>
            <p className="text-slate-500 text-sm mb-7">
              {mode === 'login'
                ? 'Use suas credenciais para continuar.'
                : 'Preencha os dados abaixo para começar.'}
            </p>

            {apiError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
                {apiError}
              </div>
            )}

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
                    className="text-xs text-cyan-700 hover:text-cyan-800 font-medium transition-colors"
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

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-cyan-700 hover:text-cyan-800 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

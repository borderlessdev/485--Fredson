import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage, login, register } from '@/services/auth';
import GammaLogo from '@/components/GammaLogo';

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

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

const STEPS = [
  { t: 'Carteira', d: 'Visão financeira consolidada' },
  { t: 'Esteira', d: 'Operação por status' },
  { t: 'Cessão', d: 'Fechamento com rastreio' },
];

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
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
      {/* Brand panel — geometria do G: anel + haste vertical */}
      <section
        className="relative hidden min-h-dvh flex-col overflow-hidden px-12 py-11 xl:px-16 lg:flex"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 0% -10%, rgba(11,213,187,.38), transparent 52%), radial-gradient(ellipse 55% 45% at 100% 110%, rgba(0,191,168,.22), transparent 48%), linear-gradient(168deg, #042E2B 0%, #0A4A44 46%, #0C5F56 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")",
          }}
        />

        {/* Anel do G — elemento proprietário */}
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border-[10px] border-[#0BD5BB]/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 top-[calc(50%-8px)] h-[10px] w-36 rounded-full bg-[#0BD5BB]/35"
          aria-hidden
        />

        <div className="relative z-10">
          <div className="inline-flex items-center rounded-2xl bg-white px-5 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,.18)]">
            <GammaLogo size="lg" className="!h-[4.75rem] !max-w-[280px]" />
          </div>
        </div>

        <div className="relative z-10 mt-auto max-w-[34rem] pb-2 pt-20">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7FE8D8]">
            Workspace Gamma
          </p>
          <h1 className="font-display text-[2.55rem] font-semibold leading-[1.08] tracking-[-0.038em] text-white xl:text-[2.9rem]">
            Gestão precisa para cada etapa da cessão.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#C5EFE8]/90">
            Da entrada do credor à conclusão da cessão — carteira, documentos, propostas e decisões em uma trilha só.
          </p>

          <ol className="relative mt-12 ml-4 border-l border-[#0BD5BB]/35 pl-8">
            {STEPS.map((s, i) => (
              <li key={s.t} className={`relative ${i < STEPS.length - 1 ? 'pb-7' : ''}`}>
                <span className="absolute -left-[2.65rem] top-0 flex h-7 w-7 items-center justify-center rounded-full border-[2.5px] border-[#0BD5BB] bg-[#053833] font-display text-[11px] font-bold text-[#0BD5BB]">
                  {i + 1}
                </span>
                <p className="font-display text-[15px] font-semibold text-white">{s.t}</p>
                <p className="mt-0.5 text-[12px] text-[#9FD9CF]">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative z-10 mt-10 text-[11px] tracking-wide text-[#7FE8D8]/80">
          Ambiente seguro · acesso restrito
        </p>
      </section>

      {/* Form */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-y-auto bg-gamma-bg px-5 py-10 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(11,213,187,.12),_transparent_70%)]" aria-hidden />

        <div className="relative z-10 w-full max-w-[420px] py-4 animate-slide-up">
          <div className="mb-8 flex justify-center rounded-2xl border border-gamma-border bg-white px-5 py-4 shadow-gamma lg:hidden">
            <GammaLogo size="lg" className="!h-16 !max-w-[240px]" />
          </div>

          <div className="rounded-[18px] border border-gamma-border bg-white px-7 py-8 shadow-gamma-md sm:px-9 sm:py-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gamma-strong">
              {mode === 'login' ? 'Acesso ao workspace' : 'Criar acesso'}
            </p>
            <h2 className="font-display mt-2.5 text-[1.85rem] font-semibold leading-tight tracking-[-0.035em] text-gamma-text">
              {mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-gamma-secondary">
              {mode === 'login'
                ? 'Entre com suas credenciais para o Gamma Precatórios.'
                : 'Dados essenciais para começar a operar.'}
            </p>

            {apiError && (
              <div role="alert" className="mt-5 rounded-gamma border border-[#F1D6D9] bg-[#FFF3F4] px-4 py-3 text-sm text-gamma-danger">
                {apiError}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="mt-8 space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
                    E-mail corporativo
                  </label>
                  <input
                    id="login-email"
                    {...loginForm.register('email')}
                    type="email"
                    autoComplete="email"
                    className="input-field h-11"
                    placeholder="nome@empresa.com.br"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="error-text">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="input-field h-11 pr-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gamma-muted transition-colors hover:text-gamma-text"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <IconEye open={showPassword} />
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="error-text">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-gamma-secondary">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gamma-border-strong text-gamma-strong accent-gamma-strong focus:ring-gamma-strong"
                    />
                    Manter acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[13px] font-bold text-gamma-strong transition-colors hover:text-[#00a894]"
                  >
                    Esqueci a senha
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary mt-1 w-full !min-h-12 !text-[14px]">
                  {isSubmitting ? (
                    <>
                      <Spinner /> Entrando…
                    </>
                  ) : (
                    'Entrar no Gamma'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="mt-8 space-y-4" noValidate>
                <div>
                  <label htmlFor="reg-name" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
                    Nome completo
                  </label>
                  <input id="reg-name" {...registerForm.register('name')} type="text" className="input-field h-11" autoComplete="name" />
                  {registerForm.formState.errors.name && (
                    <p className="error-text">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reg-email" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
                    E-mail
                  </label>
                  <input id="reg-email" {...registerForm.register('email')} type="email" className="input-field h-11" autoComplete="email" />
                  {registerForm.formState.errors.email && (
                    <p className="error-text">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reg-password" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      {...registerForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="input-field h-11 pr-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gamma-muted hover:text-gamma-text"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <IconEye open={showPassword} />
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="error-text">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reg-confirm" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      {...registerForm.register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      className="input-field h-11 pr-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gamma-muted hover:text-gamma-text"
                      aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <IconEye open={showConfirm} />
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="error-text">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary mt-1 w-full !min-h-12 !text-[14px]">
                  {isSubmitting ? (
                    <>
                      <Spinner /> Cadastrando…
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-gamma-border pt-5 text-center text-[13px] text-gamma-secondary">
              {mode === 'login' ? 'Primeiro acesso?' : 'Já tem uma conta?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-gamma-strong hover:text-[#00a894]"
              >
                {mode === 'login' ? 'Criar minha conta' : 'Entrar'}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-gamma-muted">
            Ambiente corporativo protegido. Acessos e movimentações ficam registrados para auditoria.
          </p>
        </div>
      </section>
    </main>
  );
}

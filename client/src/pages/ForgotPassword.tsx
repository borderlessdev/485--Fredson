import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/services/auth';

const forgotSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotForm) {
    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');
    try {
      const response = await forgotPassword(data);
      setSuccessMessage(response.message);
      form.reset();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setApiError(error.response?.data?.error ?? 'Não foi possível enviar a solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left: Brand panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 40%, #06b6d4 100%)' }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}
        />
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
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
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

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Recuperar acesso</h2>
          <p className="text-slate-500 text-sm mb-7 leading-relaxed">
            Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
          </p>

          {/* Success */}
          {successMessage && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Error */}
          {apiError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                {...form.register('email')}
                type="email"
                placeholder="usuario@empresa.com"
                autoComplete="email"
                className="input-field"
              />
              {form.formState.errors.email && (
                <p className="error-text">{form.formState.errors.email.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Enviando...
                </span>
              ) : 'Enviar instruções'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cyan-600 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

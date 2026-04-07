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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] animate-slide-up">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">485</span>
          </div>

          {/* Icon decorativo */}
          <div className="w-12 h-12 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-1">Recuperar acesso</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Informe seu e-mail e enviaremos as instruções para você redefinir sua senha.
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

          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
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

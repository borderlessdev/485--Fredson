import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { changeCurrentUserPassword, getAuthErrorMessage } from '@/services/auth';

export default function TrocarSenhaModal() {
  const { user, signIn, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Use ao menos uma letra maiúscula, uma minúscula e um número.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password === currentPassword) {
      setError('A nova senha deve ser diferente da atual.');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await changeCurrentUserPassword(currentPassword, password);
      signIn(updatedUser);
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-gamma border border-gamma-border-strong bg-white px-3 py-2.5 text-sm outline-none focus:border-gamma-strong focus:shadow-gamma-focus';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trocar-senha-titulo"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#042E2B]/70 p-4 backdrop-blur-sm"
    >
      <section className="w-full max-w-md rounded-gamma-card border border-gamma-border bg-white p-6 shadow-gamma-md sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gamma-soft text-[#177566]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="kicker-gamma">Primeiro acesso</p>
            <h2 id="trocar-senha-titulo" className="font-display mt-1 text-xl font-semibold text-gamma-text">
              Defina sua nova senha
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-gamma-secondary">
              {user?.name ? `${user.name}, por ` : 'Por '}segurança, troque a senha fornecida pelo administrador
              antes de usar o sistema.
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-gamma border border-[#F1D6D9] bg-[#FFF3F4] px-3 py-2.5 text-sm text-gamma-danger">
            {error}
          </p>
        ) : null}

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
          <div>
            <label htmlFor="modal-current-password" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
              Senha atual
            </label>
            <input
              id="modal-current-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="modal-new-password" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
              Nova senha
            </label>
            <div className="relative">
              <input
                id="modal-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-3 text-xs font-semibold text-gamma-secondary"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="modal-confirm-password" className="mb-1.5 block text-[13px] font-semibold text-gamma-text">
              Confirmar nova senha
            </label>
            <input
              id="modal-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className={inputClass}
            />
          </div>

          <p className="text-[11px] leading-5 text-gamma-muted">
            Mínimo de 8 caracteres, com letra maiúscula, minúscula e número.
          </p>

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
            {saving ? 'Salvando…' : 'Confirmar e acessar'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 w-full text-center text-xs font-semibold text-gamma-muted hover:text-gamma-danger"
        >
          Sair e voltar ao login
        </button>
      </section>
    </div>
  );
}

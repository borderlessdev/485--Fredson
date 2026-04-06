import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8 animate-fade-in">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-white font-semibold">485</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-600/40 flex items-center justify-center text-indigo-400 font-semibold text-sm">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Olá, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-400">Você está logado com sucesso. Bem-vindo ao dashboard!</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Status', value: 'Ativo', icon: '✅', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
            { label: 'ID de Usuário', value: `#${user?.id}`, icon: '🔑', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
            { label: 'Token', value: 'JWT Válido', icon: '🔐', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-5 ${item.color}`}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">{item.label}</p>
              <p className="text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* User info card */}
        <div className="bg-gray-900/80 border border-gray-800/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações da conta</h3>
          <div className="space-y-3">
            {[
              { label: 'Nome', value: user?.name },
              { label: 'E-mail', value: user?.email },
              { label: 'ID', value: user?.id },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="text-sm text-gray-200 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  control: 'Kontrola',
  user: 'Korisnik',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'badge-admin',
  control: 'badge-control',
  user: 'badge-user',
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl">OK Strojevi</h1>
          <button onClick={logout} className="btn-secondary">
            Odjava
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Prijavljeni ste kao</div>
          <div className="mt-1 flex items-center gap-3 flex-wrap">
            <div className="font-semibold text-slate-900">{user.name}</div>
            <div className="text-slate-500 text-sm">{user.email}</div>
            <span className={ROLE_BADGE[user.role] ?? 'badge'}>
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>

        {user.role === 'admin' && (
          <section className="card p-5">
            <h2 className="mb-4">Administratorski dio</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/admin/strojevi')}
                className="btn-primary"
              >
                Upravljanje strojevima
              </button>
              <button
                onClick={() => navigate('/admin/gradilista')}
                className="btn-primary"
              >
                Upravljanje gradilištima
              </button>
              <button
                onClick={() => navigate('/admin/dnevnici')}
                className="btn-primary"
              >
                Strojevi
              </button>
            </div>
          </section>
        )}

        {user.role === 'control' && (
          <section className="card p-5">
            <h2 className="mb-2">Kontrolni dio</h2>
            <p className="text-slate-600 text-sm">
              Pregled i provjera zapisa o strojevima.
            </p>
          </section>
        )}

        {user.role === 'user' && (
          <section className="card p-5">
            <button
              onClick={() => navigate('/dnevnik-rada-stroja')}
              className="btn-primary"
            >
              Dnevnik Rada Stroja
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

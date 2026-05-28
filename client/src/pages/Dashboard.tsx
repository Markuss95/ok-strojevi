import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  control: 'Kontrola',
  user: 'Korisnik',
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>OK Strojevi</h1>
        <button onClick={logout} style={{ padding: '6px 12px' }}>
          Odjava
        </button>
      </header>
      <p>
        Prijavljeni ste kao <strong>{user.name}</strong> ({user.email})
      </p>
      <p>
        Uloga: <strong>{ROLE_LABELS[user.role] ?? user.role}</strong>
      </p>

      {user.role === 'admin' && (
        <section>
          <h2>Administratorski dio</h2>
          <p>Upravljanje korisnicima, ulogama i svim strojevima.</p>
        </section>
      )}
      {user.role === 'control' && (
        <section>
          <h2>Kontrolni dio</h2>
          <p>Pregled i provjera zapisa o strojevima.</p>
        </section>
      )}
      {user.role === 'user' && (
        <section>
          <button
            onClick={() => navigate('/dnevnik-rada-stroja')}
            style={{ padding: '10px 16px', fontSize: 16 }}
          >
            Dnevnik Rada Stroja
          </button>
        </section>
      )}
    </div>
  );
}

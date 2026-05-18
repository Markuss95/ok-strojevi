import { useAuth } from '../auth/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  control: 'Control',
  user: 'User',
};

export function Dashboard() {
  const { user, logout } = useAuth();
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
          Log out
        </button>
      </header>
      <p>
        Signed in as <strong>{user.name}</strong> ({user.email})
      </p>
      <p>
        Role: <strong>{ROLE_LABELS[user.role] ?? user.role}</strong>
      </p>

      {user.role === 'admin' && (
        <section>
          <h2>Administrator area</h2>
          <p>Manage users, roles and all machines.</p>
        </section>
      )}
      {user.role === 'control' && (
        <section>
          <h2>Control area</h2>
          <p>Review and verify machine records.</p>
        </section>
      )}
      {user.role === 'user' && (
        <section>
          <h2>User area</h2>
          <p>Your machines and tasks.</p>
        </section>
      )}
    </div>
  );
}

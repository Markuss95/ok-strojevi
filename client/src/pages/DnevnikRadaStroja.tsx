import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { MachineSelect, Machine } from '../components/MachineSelect';

export function DnevnikRadaStroja() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selected, setSelected] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ machines: Machine[] }>('/machines')
      .then((res) => setMachines(res.machines))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju strojeva')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        ← Natrag
      </button>
      <h1>Dnevnik Rada Stroja</h1>

      {loading && <p>Učitavanje…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && (
        <label style={{ display: 'block', marginBottom: 12 }}>
          Stroj
          <MachineSelect machines={machines} value={selected} onChange={setSelected} />
        </label>
      )}
    </div>
  );
}

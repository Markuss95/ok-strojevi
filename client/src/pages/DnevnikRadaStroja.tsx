import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Machine, ConstructionSite } from '../api/types';
import { Combobox } from '../components/Combobox';

export function DnevnikRadaStroja() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [site, setSite] = useState<ConstructionSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ machines: Machine[] }>('/machines'),
      apiFetch<{ sites: ConstructionSite[] }>('/sites'),
    ])
      .then(([m, s]) => {
        setMachines(m.machines);
        setSites(s.sites);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="btn-link">
            ← Natrag
          </button>
          <h1 className="text-xl">Dnevnik Rada Stroja</h1>
          <div />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="card p-6 space-y-5">
          {loading && <p className="text-slate-500">Učitavanje…</p>}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              <div>
                <label className="label">Stroj</label>
                <Combobox<Machine>
                  items={machines}
                  value={machine}
                  onChange={setMachine}
                  getKey={(m) => m._id}
                  getLabel={(m) => `${m.name} (${m.inv})`}
                  getSearchableText={(m) => [m.name, m.inv, m.category ?? '']}
                  getSecondary={(m) =>
                    `Inv. br. ${m.inv}${m.category ? ` · ${m.category}` : ''}`
                  }
                  placeholder="Odaberite stroj…"
                />
              </div>

              <div>
                <label className="label">Gradilište</label>
                <Combobox<ConstructionSite>
                  items={sites}
                  value={site}
                  onChange={setSite}
                  getKey={(s) => s._id}
                  getLabel={(s) => `${s.code} — ${s.name}`}
                  getSearchableText={(s) => [s.code, s.name]}
                  getSecondary={(s) => `Šifra: ${s.code}`}
                  placeholder="Odaberite gradilište…"
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

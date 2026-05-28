import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { ConstructionSite } from '../api/types';

export function ManageGradilista() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');

  function load() {
    setLoading(true);
    apiFetch<{ sites: ConstructionSite[] }>('/sites')
      .then((res) => setSites(res.sites))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju gradilišta')
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await apiFetch('/sites', {
        method: 'POST',
        body: JSON.stringify({ code: newCode, name: newName }),
      });
      setNewCode('');
      setNewName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri dodavanju');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(s: ConstructionSite) {
    setEditId(s._id);
    setEditCode(s.code);
    setEditName(s.name);
  }

  function cancelEdit() {
    setEditId(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      await apiFetch(`/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ code: editCode, name: editName }),
      });
      setEditId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri spremanju');
    }
  }

  async function onDelete(s: ConstructionSite) {
    if (!confirm(`Obrisati gradilište "${s.code} — ${s.name}"?`)) return;
    setError(null);
    try {
      await apiFetch(`/sites/${s._id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri brisanju');
    }
  }

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? sites.filter(
        (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      )
    : sites;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="btn-link">
            ← Natrag
          </button>
          <h1 className="text-xl">Upravljanje gradilištima</h1>
          <div />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <section className="card p-5">
          <h2 className="mb-3">Dodaj novo gradilište</h2>
          <form onSubmit={onAdd} className="flex flex-wrap gap-2">
            <input
              placeholder="Šifra"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              required
              className="field flex-[1_1_140px]"
            />
            <input
              placeholder="Naziv"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="field flex-[3_1_280px]"
            />
            <button type="submit" disabled={adding} className="btn-primary">
              {adding ? 'Spremanje…' : 'Dodaj'}
            </button>
          </form>
        </section>

        <section className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <input
              placeholder="Pretraga…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="field"
            />
          </div>

          {loading ? (
            <p className="p-4 text-slate-500">Učitavanje…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-40">Šifra</th>
                    <th>Naziv</th>
                    <th className="w-48">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id}>
                      {editId === s._id ? (
                        <>
                          <td>
                            <input
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                              className="field"
                            />
                          </td>
                          <td>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="field"
                            />
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(s._id)}
                                className="btn-primary !px-3 !py-1.5 !text-xs"
                              >
                                Spremi
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="btn-secondary !px-3 !py-1.5 !text-xs"
                              >
                                Odustani
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="font-medium text-slate-900">{s.code}</td>
                          <td className="text-slate-700">{s.name}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(s)}
                                className="btn-secondary !px-3 !py-1.5 !text-xs"
                              >
                                Uredi
                              </button>
                              <button
                                onClick={() => onDelete(s)}
                                className="btn-danger !px-3 !py-1.5 !text-xs"
                              >
                                Obriši
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-slate-400 py-6">
                        Nema rezultata
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

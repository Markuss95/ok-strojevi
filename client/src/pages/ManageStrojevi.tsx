import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Machine } from '../api/types';

export function ManageStrojevi() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const [newName, setNewName] = useState('');
  const [newInv, setNewInv] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editInv, setEditInv] = useState('');
  const [editCategory, setEditCategory] = useState('');

  function load() {
    setLoading(true);
    apiFetch<{ machines: Machine[] }>('/machines')
      .then((res) => setMachines(res.machines))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju strojeva')
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await apiFetch('/machines', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          inv: newInv,
          category: newCategory || undefined,
        }),
      });
      setNewName('');
      setNewInv('');
      setNewCategory('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri dodavanju');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(m: Machine) {
    setEditId(m._id);
    setEditName(m.name);
    setEditInv(m.inv);
    setEditCategory(m.category ?? '');
  }

  function cancelEdit() {
    setEditId(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      await apiFetch(`/machines/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName,
          inv: editInv,
          category: editCategory,
        }),
      });
      setEditId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri spremanju');
    }
  }

  async function onDelete(m: Machine) {
    if (!confirm(`Obrisati stroj "${m.name} (${m.inv})"?`)) return;
    setError(null);
    try {
      await apiFetch(`/machines/${m._id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri brisanju');
    }
  }

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? machines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.inv.toLowerCase().includes(q) ||
          (m.category ?? '').toLowerCase().includes(q)
      )
    : machines;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="btn-link">
            ← Natrag
          </button>
          <h1 className="text-xl">Upravljanje strojevima</h1>
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
          <h2 className="mb-3">Dodaj novi stroj</h2>
          <form onSubmit={onAdd} className="flex flex-wrap gap-2">
            <input
              placeholder="Naziv"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="field flex-[2_1_220px]"
            />
            <input
              placeholder="Inv. broj"
              value={newInv}
              onChange={(e) => setNewInv(e.target.value)}
              required
              className="field flex-[1_1_140px]"
            />
            <input
              placeholder="Kategorija (neobavezno)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="field flex-[1_1_180px]"
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
                    <th>Naziv</th>
                    <th>Inv. broj</th>
                    <th>Kategorija</th>
                    <th className="w-48">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m._id}>
                      {editId === m._id ? (
                        <>
                          <td>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="field"
                            />
                          </td>
                          <td>
                            <input
                              value={editInv}
                              onChange={(e) => setEditInv(e.target.value)}
                              className="field"
                            />
                          </td>
                          <td>
                            <input
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="field"
                            />
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(m._id)}
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
                          <td className="font-medium text-slate-900">{m.name}</td>
                          <td className="text-slate-700">{m.inv}</td>
                          <td className="text-slate-600">{m.category ?? ''}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(m)}
                                className="btn-secondary !px-3 !py-1.5 !text-xs"
                              >
                                Uredi
                              </button>
                              <button
                                onClick={() => onDelete(m)}
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
                      <td colSpan={4} className="text-center text-slate-400 py-6">
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

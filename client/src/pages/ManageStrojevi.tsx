import { FormEvent, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Machine } from '../api/types';
import { useCrudResource } from '../hooks/useCrudResource';

const EMPTY_DRAFT = { name: '', inv: '', category: '' };

export function ManageStrojevi() {
  const {
    filtered,
    loading,
    error,
    filter,
    setFilter,
    create,
    update,
    remove,
  } = useCrudResource<Machine>({
    endpoint: '/machines',
    responseKey: 'machines',
    searchableFields: (m) => [m.name, m.inv, m.category ?? ''],
    loadErrorMessage: 'Greška pri učitavanju strojeva',
    addErrorMessage: 'Greška pri dodavanju',
    saveErrorMessage: 'Greška pri spremanju',
    deleteErrorMessage: 'Greška pri brisanju',
  });

  const [newDraft, setNewDraft] = useState(EMPTY_DRAFT);
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState(EMPTY_DRAFT);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    const ok = await create({
      name: newDraft.name,
      inv: newDraft.inv,
      category: newDraft.category || undefined,
    });
    setAdding(false);
    if (ok) setNewDraft(EMPTY_DRAFT);
  }

  function startEdit(m: Machine) {
    setEditId(m._id);
    setEditDraft({ name: m.name, inv: m.inv, category: m.category ?? '' });
  }

  async function saveEdit(id: string) {
    const ok = await update(id, editDraft);
    if (ok) setEditId(null);
  }

  async function onDelete(m: Machine) {
    if (!confirm(`Obrisati stroj "${m.name} (${m.inv})"?`)) return;
    await remove(m._id);
  }

  return (
    <PageShell title="Upravljanje strojevima" error={error}>
      <section className="card p-5">
        <h2 className="mb-3">Dodaj novi stroj</h2>
        <form onSubmit={onAdd} className="flex flex-wrap gap-2">
          <input
            placeholder="Naziv"
            value={newDraft.name}
            onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
            required
            className="field flex-[2_1_220px]"
          />
          <input
            placeholder="Inv. broj"
            value={newDraft.inv}
            onChange={(e) => setNewDraft({ ...newDraft, inv: e.target.value })}
            required
            className="field flex-[1_1_140px]"
          />
          <input
            placeholder="Kategorija (neobavezno)"
            value={newDraft.category}
            onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })}
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
                            value={editDraft.name}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, name: e.target.value })
                            }
                            className="field"
                          />
                        </td>
                        <td>
                          <input
                            value={editDraft.inv}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, inv: e.target.value })
                            }
                            className="field"
                          />
                        </td>
                        <td>
                          <input
                            value={editDraft.category}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, category: e.target.value })
                            }
                            className="field"
                          />
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(m._id)}
                              className="btn-primary btn-sm"
                            >
                              Spremi
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="btn-secondary btn-sm"
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
                              className="btn-secondary btn-sm"
                            >
                              Uredi
                            </button>
                            <button
                              onClick={() => onDelete(m)}
                              className="btn-danger btn-sm"
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
    </PageShell>
  );
}

import { FormEvent, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { ConstructionSite } from '../api/types';
import { useCrudResource } from '../hooks/useCrudResource';

const EMPTY_DRAFT = { code: '', name: '' };

export function ManageGradilista() {
  const {
    filtered,
    loading,
    error,
    filter,
    setFilter,
    create,
    update,
    remove,
  } = useCrudResource<ConstructionSite>({
    endpoint: '/sites',
    responseKey: 'sites',
    searchableFields: (s) => [s.code, s.name],
    loadErrorMessage: 'Greška pri učitavanju gradilišta',
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
    const ok = await create(newDraft);
    setAdding(false);
    if (ok) setNewDraft(EMPTY_DRAFT);
  }

  function startEdit(s: ConstructionSite) {
    setEditId(s._id);
    setEditDraft({ code: s.code, name: s.name });
  }

  async function saveEdit(id: string) {
    const ok = await update(id, editDraft);
    if (ok) setEditId(null);
  }

  async function onDelete(s: ConstructionSite) {
    if (!confirm(`Obrisati gradilište "${s.code} — ${s.name}"?`)) return;
    await remove(s._id);
  }

  return (
    <PageShell title="Upravljanje gradilištima" error={error}>
      <section className="card p-5">
        <h2 className="mb-3">Dodaj novo gradilište</h2>
        <form onSubmit={onAdd} className="flex flex-wrap gap-2">
          <input
            placeholder="Šifra"
            value={newDraft.code}
            onChange={(e) => setNewDraft({ ...newDraft, code: e.target.value })}
            required
            className="field flex-[1_1_140px]"
          />
          <input
            placeholder="Naziv"
            value={newDraft.name}
            onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
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
                            value={editDraft.code}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, code: e.target.value })
                            }
                            className="field"
                          />
                        </td>
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(s._id)}
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
                        <td className="font-medium text-slate-900">{s.code}</td>
                        <td className="text-slate-700">{s.name}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(s)}
                              className="btn-secondary btn-sm"
                            >
                              Uredi
                            </button>
                            <button
                              onClick={() => onDelete(s)}
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
    </PageShell>
  );
}

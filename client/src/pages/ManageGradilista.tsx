import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { ConstructionSite } from '../api/types';
import { useCrudResource } from '../hooks/useCrudResource';
import { SiteFormModal, SitePayload } from '../components/SiteFormModal';

type ModalState =
  | { mode: 'add' }
  | { mode: 'edit'; site: ConstructionSite }
  | null;

function mapsLink(s: ConstructionSite): string {
  const loc = s.location!;
  return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
}

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
    searchableFields: (s) => [s.code, s.name, s.location?.address ?? ''],
    loadErrorMessage: 'Greška pri učitavanju gradilišta',
    addErrorMessage: 'Greška pri dodavanju',
    saveErrorMessage: 'Greška pri spremanju',
    deleteErrorMessage: 'Greška pri brisanju',
  });

  const [modal, setModal] = useState<ModalState>(null);
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  function openAdd() {
    setModalError(null);
    setModal({ mode: 'add' });
  }

  function openEdit(site: ConstructionSite) {
    setModalError(null);
    setModal({ mode: 'edit', site });
  }

  function closeModal() {
    setModal(null);
    setModalError(null);
  }

  async function onSubmit(payload: SitePayload) {
    if (!modal) return;
    setBusy(true);
    setModalError(null);
    const ok =
      modal.mode === 'add'
        ? await create(payload)
        : await update(modal.site._id, payload);
    setBusy(false);
    if (ok) closeModal();
    else setModalError('Greška pri spremanju gradilišta');
  }

  async function onDelete(s: ConstructionSite) {
    if (!confirm(`Obrisati gradilište "${s.code} — ${s.name}"?`)) return;
    await remove(s._id);
  }

  return (
    <PageShell title="Upravljanje gradilištima" error={error}>
      <section className="card p-5 flex items-center justify-between gap-4">
        <h2>Gradilišta</h2>
        <button onClick={openAdd} className="btn-primary">
          Dodaj novo gradilište
        </button>
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
                  <th>Lokacija</th>
                  <th className="w-48">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td className="font-medium text-slate-900">{s.code}</td>
                    <td className="text-slate-700">{s.name}</td>
                    <td className="text-slate-600">
                      {s.location ? (
                        <a
                          href={mapsLink(s)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-link"
                          title={`${s.location.lat.toFixed(5)}, ${s.location.lng.toFixed(5)}`}
                        >
                          {s.location.address ??
                            `${s.location.lat.toFixed(5)}, ${s.location.lng.toFixed(5)}`}
                        </a>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                          Nije postavljena
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
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

      {modal && (
        <SiteFormModal
          site={modal.mode === 'edit' ? modal.site : null}
          busy={busy}
          error={modalError}
          onSubmit={onSubmit}
          onClose={closeModal}
        />
      )}
    </PageShell>
  );
}

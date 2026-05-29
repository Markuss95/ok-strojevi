import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import { toErrorMessage } from '../api/errors';
import { WorkLog } from '../api/types';
import { PageShell } from '../components/PageShell';

const MAZIVA_LABELS: Record<string, string> = {
  motUlje: 'Mot. ulje',
  hidraol: 'Hidraol',
  at: 'AT',
  ostalo: 'Ostalo',
};

const PARAM_LABELS: { key: keyof WorkLog['params']; label: string; suffix?: string }[] = [
  { key: 'motobrojilo', label: 'Motobrojilo' },
  { key: 'pocetno', label: 'Početno' },
  { key: 'zavrsno', label: 'Završno' },
  { key: 'ukupno', label: 'Ukupno' },
  { key: 'odrzavanje', label: 'Održavanje', suffix: 'h' },
  { key: 'selLabudicom', label: 'Sel. labudicom', suffix: 'h' },
  { key: 'samohodno', label: 'Samohodno', suffix: 'h' },
  { key: 'visaSila', label: 'Viša sila', suffix: 'h' },
  { key: 'cekanje', label: 'Čekanje', suffix: 'h' },
  { key: 'ostvarenoSati', label: 'Ostvareno sati' },
  { key: 'stroj', label: 'Stroj', suffix: 'h' },
  { key: 'strojar', label: 'Strojar', suffix: 'h' },
];

function fmt(n?: number): string {
  return n === undefined || n === null ? '—' : String(n);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 text-right">{value}</span>
    </div>
  );
}

function WorkLogDetailModal({ log, onClose }: { log: WorkLog; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="card w-full max-w-lg p-5 my-8 space-y-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2>Dnevnik rada stroja</h2>
          <button onClick={onClose} className="btn-secondary btn-sm">
            Zatvori
          </button>
        </div>

        <div className="text-sm">
          <DetailRow label="Datum" value={log.date} />
          <DetailRow label="Stroj" value={`${log.machineName} (${log.machineInv})`} />
          <DetailRow label="Gradilište" value={`${log.siteCode} — ${log.siteName}`} />
          <DetailRow label="Korisnik" value={log.createdByName} />
        </div>

        {(log.opisUcinak || log.opisRezija) && (
          <div className="text-sm space-y-2">
            {log.opisUcinak && (
              <div>
                <div className="label">Opis rada u učinku</div>
                <p className="text-slate-700 whitespace-pre-wrap">{log.opisUcinak}</p>
              </div>
            )}
            {log.opisRezija && (
              <div>
                <div className="label">Opis rada u režiji</div>
                <p className="text-slate-700 whitespace-pre-wrap">{log.opisRezija}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-sm">
          <div className="label">Parametri</div>
          <div className="grid grid-cols-2 gap-x-4">
            {PARAM_LABELS.map(({ key, label, suffix }) => (
              <DetailRow
                key={key}
                label={label}
                value={
                  log.params[key] === undefined
                    ? '—'
                    : `${log.params[key]}${suffix ? ` ${suffix}` : ''}`
                }
              />
            ))}
          </div>
          {log.params.razlog && (
            <DetailRow label="Razlog" value={log.params.razlog} />
          )}
        </div>

        <div className="text-sm">
          <div className="label">Maziva (kg)</div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-slate-500 text-left">
                <th className="py-1 font-medium">Mazivo</th>
                <th className="py-1 font-medium">Izmjena</th>
                <th className="py-1 font-medium">Dopuna</th>
              </tr>
            </thead>
            <tbody>
              {(['motUlje', 'hidraol', 'at', 'ostalo'] as const).map((k) => (
                <tr key={k} className="border-t border-slate-100">
                  <td className="py-1 text-slate-700">{MAZIVA_LABELS[k]}</td>
                  <td className="py-1">{fmt(log.maziva[k]?.izmjena)}</td>
                  <td className="py-1">{fmt(log.maziva[k]?.dopuna)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DnevniciRada() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<WorkLog | null>(null);

  useEffect(() => {
    apiFetch<{ logs: WorkLog[] }>('/worklogs')
      .then((res) => setLogs(res.logs))
      .catch((err) => setError(toErrorMessage(err, 'Greška pri učitavanju dnevnika')))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return logs.filter((l) =>
      [l.date, l.machineName, l.machineInv, l.siteCode, l.siteName, l.createdByName]
        .some((s) => s.toLowerCase().includes(q))
    );
  }, [logs, filter]);

  return (
    <PageShell title="Dnevnici rada strojeva" error={error}>
      <section className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input
            placeholder="Pretraga (stroj, gradilište, korisnik, datum)…"
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
                  <th className="w-32">Datum</th>
                  <th>Stroj</th>
                  <th>Gradilište</th>
                  <th>Korisnik</th>
                  <th className="w-28">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l._id}>
                    <td className="text-slate-700">{l.date}</td>
                    <td className="font-medium text-slate-900">
                      {l.machineName}{' '}
                      <span className="text-slate-400 font-normal">({l.machineInv})</span>
                    </td>
                    <td className="text-slate-700">
                      {l.siteCode} — {l.siteName}
                    </td>
                    <td className="text-slate-700">{l.createdByName}</td>
                    <td>
                      <button
                        onClick={() => setSelected(l)}
                        className="btn-secondary btn-sm"
                      >
                        Detalji
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-6">
                      Nema dnevnika
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <WorkLogDetailModal log={selected} onClose={() => setSelected(null)} />
      )}
    </PageShell>
  );
}

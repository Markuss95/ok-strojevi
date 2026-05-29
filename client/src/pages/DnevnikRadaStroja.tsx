import { ChangeEvent, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { toErrorMessage } from '../api/errors';
import { Machine, ConstructionSite } from '../api/types';
import { Combobox } from '../components/Combobox';
import { PageShell } from '../components/PageShell';

const MAZIVA = [
  { key: 'motUlje', label: 'Mot. ulje' },
  { key: 'hidraol', label: 'Hidraol' },
  { key: 'at', label: 'AT' },
  { key: 'ostalo', label: 'Ostalo' },
] as const;
type MazivoKey = (typeof MAZIVA)[number]['key'];

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  const input = (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`field ${suffix ? 'pr-7' : ''}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
  if (!label) return input;
  return (
    <div>
      <label className="label">{label}</label>
      {input}
    </div>
  );
}

// Swedish locale formats as YYYY-MM-DD, matching the `input[type=date]` value format.
function todayIso(): string {
  return new Date().toLocaleDateString('sv-SE');
}

export function DnevnikRadaStroja() {
  const today = todayIso();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [date, setDate] = useState<string>(today);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [site, setSite] = useState<ConstructionSite | null>(null);
  const [opisUcinak, setOpisUcinak] = useState('');
  const [opisRezija, setOpisRezija] = useState('');

  const [params, setParams] = useState({
    motobrojilo: '',
    pocetno: '',
    zavrsno: '',
    ukupno: '',
    odrzavanje: '',
    selLabudicom: '',
    samohodno: '',
    visaSila: '',
    cekanje: '',
    razlog: '',
    ostvarenoSati: '',
    stroj: '',
    strojar: '',
  });
  function setParam<K extends keyof typeof params>(key: K, value: string) {
    setParams((p) => ({ ...p, [key]: value }));
  }

  const [maziva, setMaziva] = useState<
    Record<MazivoKey, { izmjena: string; dopuna: string }>
  >({
    motUlje: { izmjena: '', dopuna: '' },
    hidraol: { izmjena: '', dopuna: '' },
    at: { izmjena: '', dopuna: '' },
    ostalo: { izmjena: '', dopuna: '' },
  });
  function setMazivo(key: MazivoKey, col: 'izmjena' | 'dopuna', value: string) {
    setMaziva((m) => ({ ...m, [key]: { ...m[key], [col]: value } }));
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDateChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    if (!next) {
      setDate(today);
      return;
    }
    if (next !== today) {
      const ok = window.confirm(
        'Odabrali ste datum koji nije današnji. Jeste li sigurni da želite promijeniti datum?'
      );
      // On cancel: do nothing. React's controlled-input mechanism keeps the
      // DOM <input> value in sync with the `value` prop, so it snaps back.
      if (!ok) return;
    }
    setDate(next);
  }

  useEffect(() => {
    Promise.all([
      apiFetch<{ machines: Machine[] }>('/machines'),
      apiFetch<{ sites: ConstructionSite[] }>('/sites'),
    ])
      .then(([m, s]) => {
        setMachines(m.machines);
        setSites(s.sites);
      })
      .catch((err) => setError(toErrorMessage(err, 'Greška pri učitavanju podataka')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Dnevnik Rada Stroja" maxWidth="max-w-3xl" mainMaxWidth="max-w-xl" error={error}>
      <div className="card p-6 space-y-5">
        {loading && <p className="text-slate-500">Učitavanje…</p>}

        {!loading && !error && (
            <>
              <div>
                <label className="label" htmlFor="datum">Datum</label>
                <input
                  id="datum"
                  type="date"
                  value={date}
                  onChange={onDateChange}
                  className="field"
                />
                {date !== today && (
                  <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Upozorenje: odabrani datum nije današnji.
                  </p>
                )}
              </div>

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

              <div>
                <label className="label" htmlFor="opis-ucinak">
                  Opis rada u učinku{' '}
                  <span className="text-slate-400 font-normal">(neobavezno)</span>
                </label>
                <textarea
                  id="opis-ucinak"
                  value={opisUcinak}
                  onChange={(e) => setOpisUcinak(e.target.value)}
                  rows={3}
                  className="field resize-y"
                />
              </div>

              <div>
                <label className="label" htmlFor="opis-rezija">
                  Opis rada u režiji{' '}
                  <span className="text-slate-400 font-normal">(neobavezno)</span>
                </label>
                <textarea
                  id="opis-rezija"
                  value={opisRezija}
                  onChange={(e) => setOpisRezija(e.target.value)}
                  rows={3}
                  className="field resize-y"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <NumField label="Motobrojilo" value={params.motobrojilo} onChange={(v) => setParam('motobrojilo', v)} />
                <NumField label="Početno" value={params.pocetno} onChange={(v) => setParam('pocetno', v)} />
                <NumField label="Završno" value={params.zavrsno} onChange={(v) => setParam('zavrsno', v)} />
                <NumField label="Ukupno" value={params.ukupno} onChange={(v) => setParam('ukupno', v)} />
                <NumField label="Održavanje" value={params.odrzavanje} onChange={(v) => setParam('odrzavanje', v)} suffix="h" />
                <NumField label="Sel. labudicom" value={params.selLabudicom} onChange={(v) => setParam('selLabudicom', v)} suffix="h" />
                <NumField label="Samohodno" value={params.samohodno} onChange={(v) => setParam('samohodno', v)} suffix="h" />
                <NumField label="Viša sila" value={params.visaSila} onChange={(v) => setParam('visaSila', v)} suffix="h" />
                <NumField label="Čekanje" value={params.cekanje} onChange={(v) => setParam('cekanje', v)} suffix="h" />
                <div className="col-span-2">
                  <label className="label">Razlog</label>
                  <input
                    type="text"
                    value={params.razlog}
                    onChange={(e) => setParam('razlog', e.target.value)}
                    className="field"
                  />
                </div>
                <NumField label="Ostvareno sati" value={params.ostvarenoSati} onChange={(v) => setParam('ostvarenoSati', v)} />
                <NumField label="Stroj" value={params.stroj} onChange={(v) => setParam('stroj', v)} suffix="h" />
                <NumField label="Strojar" value={params.strojar} onChange={(v) => setParam('strojar', v)} suffix="h" />
              </div>

              <div>
                <label className="label">Maziva</label>
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left font-medium text-slate-600 px-3 py-2 border-b border-slate-200 w-1/3">
                          Mazivo
                        </th>
                        <th className="text-left font-medium text-slate-600 px-3 py-2 border-b border-l border-slate-200">
                          Izmjena
                        </th>
                        <th className="text-left font-medium text-slate-600 px-3 py-2 border-b border-l border-slate-200">
                          Dopuna
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MAZIVA.map(({ key, label }, i) => (
                        <tr
                          key={key}
                          className={i < MAZIVA.length - 1 ? 'border-b border-slate-100' : ''}
                        >
                          <td className="px-3 py-2 font-medium text-slate-700">{label}</td>
                          <td className="p-1.5 border-l border-slate-200">
                            <NumField
                              value={maziva[key].izmjena}
                              onChange={(v) => setMazivo(key, 'izmjena', v)}
                              suffix="kg"
                            />
                          </td>
                          <td className="p-1.5 border-l border-slate-200">
                            <NumField
                              value={maziva[key].dopuna}
                              onChange={(v) => setMazivo(key, 'dopuna', v)}
                              suffix="kg"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
      </div>
    </PageShell>
  );
}

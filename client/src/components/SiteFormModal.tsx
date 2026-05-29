import { FormEvent, useState } from 'react';
import { ConstructionSite, SiteLocation } from '../api/types';
import { LocationPicker } from './LocationPicker';

export interface SitePayload {
  code: string;
  name: string;
  location: SiteLocation;
}

interface Props {
  /** Existing site when editing; null when adding. */
  site: ConstructionSite | null;
  busy: boolean;
  error: string | null;
  onSubmit: (payload: SitePayload) => void;
  onClose: () => void;
}

/**
 * Modal form for adding or editing a gradilište. Location is mandatory, so the
 * submit button stays disabled until a point is chosen on the map.
 */
export function SiteFormModal({ site, busy, error, onSubmit, onClose }: Props) {
  const editing = !!site;
  const [code, setCode] = useState(site?.code ?? '');
  const [name, setName] = useState(site?.name ?? '');
  const [location, setLocation] = useState<SiteLocation | null>(
    site?.location ?? null
  );

  const canSubmit = code.trim() && name.trim() && location && !busy;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || !location) return;
    onSubmit({ code: code.trim(), name: name.trim(), location });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="card w-full max-w-lg p-5 my-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4">
          {editing ? 'Uredi gradilište' : 'Dodaj novo gradilište'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="site-code">Šifra</label>
            <input
              id="site-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="site-name">Naziv</label>
            <input
              id="site-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="field"
            />
          </div>
          <div>
            <label className="label">Lokacija</label>
            <LocationPicker initial={site?.location ?? null} onChange={setLocation} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Odustani
            </button>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {busy ? 'Spremanje…' : 'Spremi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

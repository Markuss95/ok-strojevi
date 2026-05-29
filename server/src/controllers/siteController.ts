import { Request, Response } from 'express';
import { ConstructionSite, ISiteLocation } from '../models/ConstructionSite';

type ParsedLocation =
  | { provided: false }
  | { provided: true; value: ISiteLocation }
  | { provided: true; error: string };

/**
 * Validates the optional `location` field from a request body. Returns whether
 * a location was provided at all (so updates can leave it untouched), and
 * either the sanitized value or a Croatian error message.
 */
function parseLocation(raw: unknown): ParsedLocation {
  if (raw === undefined || raw === null) return { provided: false };

  if (typeof raw !== 'object') {
    return { provided: true, error: 'Lokacija je u neispravnom formatu' };
  }

  const { lat, lng, address } = raw as Record<string, unknown>;

  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { provided: true, error: 'Geografska širina (lat) nije ispravna' };
  }
  if (
    typeof lng !== 'number' ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return { provided: true, error: 'Geografska dužina (lng) nije ispravna' };
  }

  const value: ISiteLocation = { lat, lng };
  if (typeof address === 'string' && address.trim()) {
    value.address = address.trim();
  }
  return { provided: true, value };
}

export async function listSites(_req: Request, res: Response): Promise<void> {
  const sites = await ConstructionSite.find().sort({ code: 1 });
  res.json({ sites });
}

export async function createSite(req: Request, res: Response): Promise<void> {
  const { code, name } = req.body ?? {};

  if (!code || !String(code).trim()) {
    res.status(400).json({ error: 'Šifra gradilišta je obavezna' });
    return;
  }
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'Naziv gradilišta je obavezan' });
    return;
  }

  const location = parseLocation(req.body?.location);
  if (location.provided && 'error' in location) {
    res.status(400).json({ error: location.error });
    return;
  }
  if (!location.provided) {
    res.status(400).json({ error: 'Lokacija gradilišta je obavezna' });
    return;
  }

  const existing = await ConstructionSite.findOne({ code: String(code).trim() });
  if (existing) {
    res.status(409).json({ error: 'Gradilište s tom šifrom već postoji' });
    return;
  }

  const site = await ConstructionSite.create({
    code: String(code).trim(),
    name: String(name).trim(),
    location: location.value,
  });
  res.status(201).json({ site });
}

export async function updateSite(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { code, name } = req.body ?? {};

  const site = await ConstructionSite.findById(id);
  if (!site) {
    res.status(404).json({ error: 'Gradilište nije pronađeno' });
    return;
  }

  if (code !== undefined) {
    const next = String(code).trim();
    if (!next) {
      res.status(400).json({ error: 'Šifra gradilišta je obavezna' });
      return;
    }
    if (next !== site.code) {
      const clash = await ConstructionSite.findOne({ code: next });
      if (clash) {
        res.status(409).json({ error: 'Gradilište s tom šifrom već postoji' });
        return;
      }
    }
    site.code = next;
  }

  if (name !== undefined) {
    const next = String(name).trim();
    if (!next) {
      res.status(400).json({ error: 'Naziv gradilišta je obavezan' });
      return;
    }
    site.name = next;
  }

  const location = parseLocation(req.body?.location);
  if (location.provided && 'error' in location) {
    res.status(400).json({ error: location.error });
    return;
  }
  if (location.provided && 'value' in location) {
    site.location = location.value;
  }

  // Location is mandatory: a save must never leave a site without one.
  if (!site.location) {
    res.status(400).json({ error: 'Lokacija gradilišta je obavezna' });
    return;
  }

  await site.save();
  res.json({ site });
}

export async function deleteSite(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const site = await ConstructionSite.findByIdAndDelete(id);
  if (!site) {
    res.status(404).json({ error: 'Gradilište nije pronađeno' });
    return;
  }
  res.json({ ok: true });
}

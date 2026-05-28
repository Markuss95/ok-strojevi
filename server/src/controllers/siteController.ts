import { Request, Response } from 'express';
import { ConstructionSite } from '../models/ConstructionSite';

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

  const existing = await ConstructionSite.findOne({ code: String(code).trim() });
  if (existing) {
    res.status(409).json({ error: 'Gradilište s tom šifrom već postoji' });
    return;
  }

  const site = await ConstructionSite.create({
    code: String(code).trim(),
    name: String(name).trim(),
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

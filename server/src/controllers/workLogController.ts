import { Request, Response } from 'express';
import { WorkLog, IWorkLogParams, ILubricant } from '../models/WorkLog';
import { Machine } from '../models/Machine';
import { ConstructionSite } from '../models/ConstructionSite';
import { User } from '../models/User';

/** Parse a form value into a number; blank/invalid becomes undefined. */
function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

function parseParams(raw: unknown): IWorkLogParams {
  const p = (raw ?? {}) as Record<string, unknown>;
  return {
    motobrojilo: num(p.motobrojilo),
    pocetno: num(p.pocetno),
    zavrsno: num(p.zavrsno),
    ukupno: num(p.ukupno),
    odrzavanje: num(p.odrzavanje),
    selLabudicom: num(p.selLabudicom),
    samohodno: num(p.samohodno),
    visaSila: num(p.visaSila),
    cekanje: num(p.cekanje),
    razlog: str(p.razlog),
    ostvarenoSati: num(p.ostvarenoSati),
    stroj: num(p.stroj),
    strojar: num(p.strojar),
  };
}

function parseLubricant(raw: unknown): ILubricant {
  const l = (raw ?? {}) as Record<string, unknown>;
  return { izmjena: num(l.izmjena), dopuna: num(l.dopuna) };
}

export async function createWorkLog(req: Request, res: Response): Promise<void> {
  const body = req.body ?? {};
  const { machineId, siteId, date } = body;

  if (!date || !String(date).trim()) {
    res.status(400).json({ error: 'Datum je obavezan' });
    return;
  }
  if (!machineId) {
    res.status(400).json({ error: 'Stroj je obavezan' });
    return;
  }
  if (!siteId) {
    res.status(400).json({ error: 'Gradilište je obavezno' });
    return;
  }

  const [machine, site, user] = await Promise.all([
    Machine.findById(machineId),
    ConstructionSite.findById(siteId),
    User.findById(req.auth?.userId),
  ]);

  if (!machine) {
    res.status(404).json({ error: 'Stroj nije pronađen' });
    return;
  }
  if (!site) {
    res.status(404).json({ error: 'Gradilište nije pronađeno' });
    return;
  }
  if (!user) {
    res.status(401).json({ error: 'Korisnik nije pronađen' });
    return;
  }

  const maziva = (body.maziva ?? {}) as Record<string, unknown>;

  const log = await WorkLog.create({
    date: String(date).trim(),
    machine: machine._id,
    site: site._id,
    createdBy: user._id,
    machineName: machine.name,
    machineInv: machine.inv,
    siteCode: site.code,
    siteName: site.name,
    createdByName: user.name,
    opisUcinak: str(body.opisUcinak),
    opisRezija: str(body.opisRezija),
    params: parseParams(body.params),
    maziva: {
      motUlje: parseLubricant(maziva.motUlje),
      hidraol: parseLubricant(maziva.hidraol),
      at: parseLubricant(maziva.at),
      ostalo: parseLubricant(maziva.ostalo),
    },
  });

  res.status(201).json({ log });
}

export async function listWorkLogs(_req: Request, res: Response): Promise<void> {
  // Newest first; by entered date, then by creation time as a tiebreaker.
  const logs = await WorkLog.find().sort({ date: -1, createdAt: -1 });
  res.json({ logs });
}

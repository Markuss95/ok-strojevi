import { Request, Response } from 'express';
import { Machine } from '../models/Machine';

export async function listMachines(_req: Request, res: Response): Promise<void> {
  const machines = await Machine.find().sort({ category: 1, name: 1, inv: 1 });
  res.json({ machines });
}

export async function createMachine(req: Request, res: Response): Promise<void> {
  const { name, inv, category } = req.body ?? {};

  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'Naziv stroja je obavezan' });
    return;
  }
  if (!inv || !String(inv).trim()) {
    res.status(400).json({ error: 'Inventarni broj je obavezan' });
    return;
  }

  const existing = await Machine.findOne({ inv: String(inv).trim() });
  if (existing) {
    res.status(409).json({ error: 'Stroj s tim inventarnim brojem već postoji' });
    return;
  }

  const machine = await Machine.create({
    name: String(name).trim(),
    inv: String(inv).trim(),
    category: category ? String(category).trim() : undefined,
  });
  res.status(201).json({ machine });
}

export async function updateMachine(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, inv, category } = req.body ?? {};

  const machine = await Machine.findById(id);
  if (!machine) {
    res.status(404).json({ error: 'Stroj nije pronađen' });
    return;
  }

  if (name !== undefined) {
    const next = String(name).trim();
    if (!next) {
      res.status(400).json({ error: 'Naziv stroja je obavezan' });
      return;
    }
    machine.name = next;
  }

  if (inv !== undefined) {
    const next = String(inv).trim();
    if (!next) {
      res.status(400).json({ error: 'Inventarni broj je obavezan' });
      return;
    }
    if (next !== machine.inv) {
      const clash = await Machine.findOne({ inv: next });
      if (clash) {
        res.status(409).json({ error: 'Stroj s tim inventarnim brojem već postoji' });
        return;
      }
    }
    machine.inv = next;
  }

  if (category !== undefined) {
    const next = String(category).trim();
    machine.category = next || undefined;
  }

  await machine.save();
  res.json({ machine });
}

export async function deleteMachine(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const machine = await Machine.findByIdAndDelete(id);
  if (!machine) {
    res.status(404).json({ error: 'Stroj nije pronađen' });
    return;
  }
  res.json({ ok: true });
}

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

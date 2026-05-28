import { Request, Response } from 'express';
import { Machine } from '../models/Machine';

export async function listMachines(_req: Request, res: Response): Promise<void> {
  const machines = await Machine.find().sort({ name: 1 });
  res.json({ machines });
}

export async function createMachine(req: Request, res: Response): Promise<void> {
  const { name } = req.body ?? {};

  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'Naziv stroja je obavezan' });
    return;
  }

  const existing = await Machine.findOne({ name: String(name).trim() });
  if (existing) {
    res.status(409).json({ error: 'Stroj s tim nazivom već postoji' });
    return;
  }

  const machine = await Machine.create({ name: String(name).trim() });
  res.status(201).json({ machine });
}

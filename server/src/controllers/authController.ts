import { Request, Response } from 'express';
import { User, ROLES, Role } from '../models/User';
import { signToken } from '../utils/token';

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body ?? {};

  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email and password are required' });
    return;
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // Only allow elevated roles to be set by an existing admin.
  let assignedRole: Role = 'user';
  if (role && ROLES.includes(role)) {
    if (role !== 'user' && req.auth?.role !== 'admin') {
      res.status(403).json({ error: 'Only an admin can assign this role' });
      return;
    }
    assignedRole = role;
  }

  const user = new User({ name, email, role: assignedRole });
  await user.setPassword(password);
  await user.save();

  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.json({ token, user });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.auth?.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
}

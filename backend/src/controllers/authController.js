import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { asyncHandler, ok } from '../utils/http.js';

export const loginSchema = z.object({
  body: z.object({ email: z.string().email('Email tidak valid').transform(v => v.toLowerCase()), password: z.string().min(8, 'Password minimal 8 karakter') }),
  query: z.object({}).passthrough(), params: z.object({}).passthrough()
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return ok(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

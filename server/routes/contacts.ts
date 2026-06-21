import { Router } from 'express';
import { prisma } from '../lib/prisma';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/contacts - get all contacts for current user
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: 'asc' },
    });
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts - create a new contact
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { name, status, word_bank, confirm_categories, messages, reply_delay, avatar_color } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const contact = await prisma.contact.create({
      data: {
        user_id: req.user!.id,
        name,
        status: status || '在线',
        word_bank: word_bank || [],
        confirm_categories: confirm_categories || [],
        messages: messages || [],
        reply_delay: reply_delay || 30000,
        avatar_color: avatar_color || 'from-[#e1b2b2] to-[#d2e6ec]',
      },
    });

    res.status(201).json({ contact });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id - update a contact
router.put('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.contact.findFirst({
      where: { id, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    const { name, status, word_bank, confirm_categories, messages, reply_delay, avatar_color } = req.body;

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        status: status !== undefined ? status : undefined,
        word_bank: word_bank !== undefined ? word_bank : undefined,
        confirm_categories: confirm_categories !== undefined ? confirm_categories : undefined,
        messages: messages !== undefined ? messages : undefined,
        reply_delay: reply_delay !== undefined ? reply_delay : undefined,
        avatar_color: avatar_color !== undefined ? avatar_color : undefined,
      },
    });

    res.json({ contact });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.contact.findFirst({
      where: { id, user_id: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    await prisma.contact.delete({ where: { id } });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

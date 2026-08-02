import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function getEvents(req: AuthRequest, res: Response) {
  try {
    const events = await prisma.event.findMany({
      include: {
        regs: {
          include: { member: true },
        },
      },
      orderBy: { dateStart: 'desc' },
    });
    return res.json({ success: true, data: events });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const { title, category, dateStart, dateEnd, location, feeAmount, description } = req.body;

    if (!title || !dateStart || !location) {
      return res.status(400).json({ success: false, message: 'Judul, tanggal mulai, dan lokasi event wajib diisi.' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        category: category || 'KEJUARAAN',
        dateStart: new Date(dateStart),
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        location,
        feeAmount: Number(feeAmount) || 0,
        description,
        status: 'MENDATANG',
      },
    });

    return res.status(201).json({ success: true, message: 'Event berhasil didaftarkan.', data: event });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function registerMemberForEvent(req: AuthRequest, res: Response) {
  try {
    const { eventId, memberId, notes } = req.body;

    if (!eventId || !memberId) {
      return res.status(400).json({ success: false, message: 'eventId dan memberId wajib diisi.' });
    }

    const reg = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId,
        notes,
        status: 'TERDAFTAR',
      },
      include: { member: true, event: true },
    });

    return res.status(201).json({ success: true, message: 'Pendaftaran event anggota berhasil.', data: reg });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

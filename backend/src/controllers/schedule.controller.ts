import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getClasses(req: AuthRequest, res: Response) {
  try {
    const classes = await prisma.trainingClass.findMany({
      include: {
        trainer: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: classes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createClass(req: AuthRequest, res: Response) {
  try {
    const { name, levelCategory, trainerId, dayOfWeek, startTime, endTime, location, description } = req.body;

    if (!name || !dayOfWeek || !startTime || !endTime || !location) {
      return res.status(400).json({ success: false, message: 'Nama kelas, hari, jam, dan lokasi wajib diisi.' });
    }

    const newClass = await prisma.trainingClass.create({
      data: {
        name,
        levelCategory,
        trainerId,
        dayOfWeek,
        startTime,
        endTime,
        location,
        description,
        status: 'AKTIF',
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'KELAS_LATIHAN',
      entityId: newClass.id,
      details: `Membuat kelas latihan baru: ${name}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Kelas berhasil dibuat.', data: newClass });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSchedules(req: AuthRequest, res: Response) {
  try {
    const { dojangId } = req.query;
    const where: any = {};
    if (dojangId) where.dojangId = String(dojangId);

    const schedules = await prisma.trainingSchedule.findMany({
      where,
      include: {
        dojang: true,
        class: true,
        trainer: { include: { user: { select: { name: true } } } },
        sessions: {
          include: {
            records: true,
          },
        },
      } as any,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: schedules });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createSchedule(req: AuthRequest, res: Response) {
  try {
    const { dojangId, classId, trainerId, dayOfWeek, startTime, endTime, title, location, notes } = req.body;

    if (!dayOfWeek || !location) {
      return res.status(400).json({ success: false, message: 'Hari latihan dan lokasi wajib diisi.' });
    }

    const scheduleTitle = title || `Latihan Rutin Hari ${dayOfWeek}`;

    const schedule = await prisma.trainingSchedule.create({
      data: {
        dojangId: dojangId || null,
        classId: classId || null,
        trainerId: trainerId || null,
        dayOfWeek: dayOfWeek || 'SELASA',
        startTime: startTime || '16:00',
        endTime: endTime || '18:00',
        title: scheduleTitle,
        location,
        notes: notes || null,
        status: 'AKTIF',
      } as any,
      include: { dojang: true } as any,
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'JADWAL_LATIHAN',
      entityId: schedule.id,
      details: `Membuat jadwal latihan rutin hari ${dayOfWeek}: ${title}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Jadwal latihan rutin berhasil dibuat.', data: schedule });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const schedule = await prisma.trainingSchedule.findUnique({ where: { id } });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Jadwal latihan tidak ditemukan.' });
    }

    await prisma.trainingSchedule.delete({ where: { id } });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'JADWAL_LATIHAN',
      entityId: id,
      details: `Menghapus jadwal latihan rutin ${schedule.title}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Jadwal latihan berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

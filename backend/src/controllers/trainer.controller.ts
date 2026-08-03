import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getTrainers(req: AuthRequest, res: Response) {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        classes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: trainers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createTrainer(req: AuthRequest, res: Response) {
  try {
    const { username, password, name, email, phone, specialty, bio, isHead } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username, password, dan nama pelatih wajib diisi.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        name,
        email,
        phone,
        role: 'PELATIH',
      },
    });

    const trainer = await prisma.trainer.create({
      data: {
        userId: user.id,
        specialty,
        bio,
        isHead: Boolean(isHead),
        status: 'AKTIF',
      },
      include: { user: true },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'PELATIH',
      entityId: trainer.id,
      details: `Menambah pelatih baru ${name} dengan username ${username}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Pelatih berhasil ditambahkan.', data: trainer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateTrainer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, phone, specialty, bio, isHead, status } = req.body;

    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Pelatih tidak ditemukan.' });
    }

    if (name || email !== undefined || phone !== undefined) {
      await prisma.user.update({
        where: { id: trainer.userId },
        data: {
          name: name || trainer.user.name,
          email: email !== undefined ? email : trainer.user.email,
          phone: phone !== undefined ? phone : trainer.user.phone,
        },
      });
    }

    const updated = await prisma.trainer.update({
      where: { id },
      data: {
        specialty,
        bio,
        isHead: isHead !== undefined ? Boolean(isHead) : trainer.isHead,
        status: status || trainer.status,
      },
      include: { user: true },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'PELATIH',
      entityId: id,
      details: `Memperbarui data pelatih ${updated.user.name}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Data pelatih berhasil diperbarui.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteTrainer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Pelatih tidak ditemukan.' });
    }

    const trainerName = trainer.user?.name || 'Pelatih';

    // Clear relations in schedules and classes
    await prisma.trainingSchedule.updateMany({
      where: { trainerId: id },
      data: { trainerId: null },
    });

    await prisma.trainingClass.updateMany({
      where: { trainerId: id },
      data: { trainerId: null },
    });

    // Delete trainer record
    await prisma.trainer.delete({ where: { id } });
    
    // Delete associated user account if present
    if (trainer.userId) {
      await prisma.user.delete({ where: { id: trainer.userId } }).catch(() => {});
    }

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'PELATIH',
      entityId: id,
      details: `Menghapus pelatih ${trainerName}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Pelatih berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


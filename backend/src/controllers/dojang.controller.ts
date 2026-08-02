import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getDojangs(req: AuthRequest, res: Response) {
  try {
    const dojangs = await prisma.dojang.findMany({
      include: {
        _count: {
          select: {
            members: true,
            schedules: true,
            trainers: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
    return res.json({ success: true, data: dojangs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createDojang(req: AuthRequest, res: Response) {
  try {
    const { code, name, address, phone, email, headTrainerName } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Kode Dojang (misal: JKT) dan Nama Dojang wajib diisi.' });
    }

    const existingCode = await prisma.dojang.findUnique({ where: { code: code.toUpperCase() } });
    if (existingCode) {
      return res.status(400).json({ success: false, message: `Kode Dojang '${code}' sudah digunakan.` });
    }

    const dojang = await prisma.dojang.create({
      data: {
        code: code.toUpperCase(),
        name,
        address,
        phone,
        email,
        headTrainerName,
        status: 'AKTIF',
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'DOJANG_CABANG',
      entityId: dojang.id,
      details: `Membuat cabang dojang baru: ${name} (${code.toUpperCase()})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Cabang Dojang berhasil didaftarkan.', data: dojang });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateDojang(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, address, phone, email, headTrainerName, status } = req.body;

    const dojang = await prisma.dojang.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        headTrainerName,
        status,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'DOJANG_CABANG',
      entityId: id,
      details: `Memperbarui data cabang dojang ${dojang.name}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Data Dojang berhasil diperbarui.', data: dojang });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteDojang(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const dojang = await prisma.dojang.findUnique({ where: { id } });

    if (!dojang) {
      return res.status(404).json({ success: false, message: 'Dojang tidak ditemukan.' });
    }

    await prisma.dojang.delete({ where: { id } });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'DOJANG_CABANG',
      entityId: id,
      details: `Menghapus cabang dojang ${dojang.name}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Cabang Dojang berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

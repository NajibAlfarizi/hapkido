import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getDojangSettings(req: AuthRequest, res: Response) {
  try {
    let settings = await prisma.dojangSetting.findUnique({ where: { id: 'DEFAULT' } });

    if (!settings) {
      settings = await prisma.dojangSetting.create({
        data: { id: 'DEFAULT' },
      });
    }

    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateDojangSettings(req: AuthRequest, res: Response) {
  try {
    const {
      dojangName,
      logoUrl,
      address,
      phone,
      email,
      academicPeriod,
      defaultMonthlyFee,
      defaultPracticeDays,
      headerText,
      footerReceiptText,
    } = req.body;

    const settings = await prisma.dojangSetting.upsert({
      where: { id: 'DEFAULT' },
      update: {
        dojangName,
        logoUrl,
        address,
        phone,
        email,
        academicPeriod,
        defaultMonthlyFee: defaultMonthlyFee !== undefined ? Number(defaultMonthlyFee) : undefined,
        defaultPracticeDays,
        headerText,
        footerReceiptText,
      },
      create: {
        id: 'DEFAULT',
        dojangName: dojangName || 'DOJANG HAPKIDO INDONESIA',
        logoUrl,
        address,
        phone,
        email,
        academicPeriod,
        defaultMonthlyFee: Number(defaultMonthlyFee) || 150000,
        defaultPracticeDays,
        headerText,
        footerReceiptText,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'PENGATURAN_DOJANG',
      entityId: 'DEFAULT',
      details: 'Memperbarui profil & pengaturan Dojang Hapkido',
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Pengaturan Dojang berhasil diperbarui.', data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

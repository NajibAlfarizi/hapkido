import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { action, entity, search } = req.query;

    const where: any = {};
    if (action) where.action = String(action);
    if (entity) where.entity = String(entity);
    if (search) {
      const s = String(search);
      where.OR = [
        { userName: { contains: s } },
        { details: { contains: s } },
        { action: { contains: s } },
        { entity: { contains: s } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

import { prisma } from '../db';

export async function createAuditLog(params: {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE
  entity: string; // ANGGOTA, PELATIH, PEMBAYARAN, ABSENSI, SETTING, etc.
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName || 'System',
        userRole: params.userRole || 'ADMIN',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}

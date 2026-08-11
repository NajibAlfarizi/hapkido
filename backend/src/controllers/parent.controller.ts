import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

// ==================== PARENT ENDPOINTS ====================

// Get children linked to the logged in Parent user
export async function getMyChildren(req: AuthRequest, res: Response) {
  try {
    const parentId = req.user?.id;

    const parentChildRecords = await prisma.parentChild.findMany({
      where: { parentId },
      include: {
        member: {
          include: {
            dojang: true,
            beltHistory: {
              include: { beltLevel: true },
              orderBy: { examDate: 'desc' },
            },
            attendance: {
              include: {
                session: {
                  include: { schedule: true },
                },
              },
              orderBy: { checkInTime: 'desc' },
              take: 20,
            },
            payments: {
              include: { duesType: true, dojang: true },
              orderBy: { paymentDate: 'desc' },
            },
          },
        },
      },
    });

    const children = parentChildRecords.map((pc) => pc.member);

    return res.json({ success: true, data: children });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Parent uploads payment proof for a child
export async function submitPaymentProof(req: AuthRequest, res: Response) {
  try {
    const parentId = req.user?.id;
    const { memberId, duesTypeId, amount, proofUrl, notes } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ success: false, message: 'Anggota (anak) dan jumlah pembayaran wajib diisi.' });
    }

    // Verify child belongs to this parent
    const link = await prisma.parentChild.findUnique({
      where: { parentId_memberId: { parentId: parentId!, memberId } },
    });

    if (!link) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke data anggota ini.' });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Data anggota tidak ditemukan.' });
    }

    const invoiceNo = `INV-PRT-${Date.now()}`;

    const payment = await prisma.payment.create({
      data: {
        invoiceNo,
        dojangId: member.dojangId,
        memberId,
        duesTypeId: duesTypeId || null,
        amount: Number(amount),
        paidAmount: Number(amount),
        paymentMethod: 'TRANSFER',
        status: 'BELUM_BAYAR', // Will be set to LUNAS by admin verification
        proofUrl: proofUrl || null,
        notes: notes || 'Pembayaran oleh Orang Tua via online upload',
        createdById: parentId,
      },
      include: { member: true, duesType: true },
    });

    await createAuditLog({
      userId: parentId,
      userName: req.user?.name,
      userRole: 'ORANG_TUA',
      action: 'CREATE',
      entity: 'PEMBAYARAN_ORANG_TUA',
      entityId: payment.id,
      details: `Orang tua ${req.user?.name} mengunggah bukti bayar Rp${amount} untuk anggota ${member.fullName}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah! Menunggu konfirmasi dari Admin Dojang.',
      data: payment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ==================== ADMIN PARENT MANAGEMENT ENDPOINTS ====================

// Admin: Get all parent user accounts
export async function getParentAccounts(req: AuthRequest, res: Response) {
  try {
    const parents = await prisma.user.findMany({
      where: { role: 'ORANG_TUA' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        phone: true,
        email: true,
        createdAt: true,
        children: {
          include: {
            member: {
              select: { id: true, fullName: true, nia: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: parents });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Admin: Approve parent account & link to member(s)
export async function approveParentAccount(req: AuthRequest, res: Response) {
  try {
    const { parentId } = req.params;
    const { memberIds, status } = req.body; // memberIds: string[], status: 'AKTIF' | 'NONAKTIF' | 'PENDING'

    const targetStatus = status || 'AKTIF';

    const parentUser = await prisma.user.update({
      where: { id: parentId },
      data: { status: targetStatus },
    });

    // If memberIds provided, update parent-child links
    if (Array.isArray(memberIds)) {
      // Remove existing links
      await prisma.parentChild.deleteMany({ where: { parentId } });

      // Add new links
      if (memberIds.length > 0) {
        await prisma.parentChild.createMany({
          data: memberIds.map((mId: string) => ({
            parentId,
            memberId: mId,
          })),
          skipDuplicates: true,
        });
      }
    }

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'USER_ORANG_TUA',
      entityId: parentId,
      details: `Admin memperbarui status akun orang tua ${parentUser.username} menjadi ${targetStatus}`,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `Akun Orang Tua ${parentUser.name} (${parentUser.username}) berhasil diperbarui!`,
      data: parentUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Admin: Delete parent account
export async function deleteParentAccount(req: AuthRequest, res: Response) {
  try {
    const { parentId } = req.params;

    const parentUser = await prisma.user.findUnique({ where: { id: parentId } });
    if (!parentUser) {
      return res.status(404).json({ success: false, message: 'Akun Orang Tua tidak ditemukan.' });
    }

    await prisma.user.delete({ where: { id: parentId } });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'USER_ORANG_TUA',
      entityId: parentId,
      details: `Admin menghapus akun orang tua ${parentUser.username}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Akun Orang Tua berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

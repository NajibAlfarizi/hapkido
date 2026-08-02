import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getDuesTypes(req: AuthRequest, res: Response) {
  try {
    const duesTypes = await prisma.duesType.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: duesTypes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createDuesType(req: AuthRequest, res: Response) {
  try {
    const { name, category, defaultAmount, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama jenis iuran wajib diisi.' });
    }

    const duesType = await prisma.duesType.create({
      data: {
        name,
        category: category || 'BULANAN',
        defaultAmount: Number(defaultAmount) || 0,
        description,
      },
    });

    return res.status(201).json({ success: true, message: 'Jenis iuran berhasil dibuat.', data: duesType });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPayments(req: AuthRequest, res: Response) {
  try {
    const { memberId, status, category } = req.query;

    const where: any = {};
    if (memberId) where.memberId = String(memberId);
    if (status) where.status = String(status);

    const payments = await prisma.payment.findMany({
      where,
      include: {
        member: true,
        duesType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: payments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPayment(req: AuthRequest, res: Response) {
  try {
    const {
      memberId,
      duesTypeId,
      amount,
      paidAmount,
      paymentMethod,
      dueDate,
      notes,
      proofUrl,
    } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ success: false, message: 'memberId dan total nominal (amount) wajib diisi.' });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.payment.count();
    const seq = String(count + 1).padStart(4, '0');
    const invoiceNo = `INV/HKD/${currentYear}/${seq}`;
    const receiptNo = `KWT-${Date.now().toString().slice(-6)}`;

    const totalAmount = Number(amount);
    const paid = Number(paidAmount || totalAmount);
    
    let status = 'LUNAS';
    if (paid <= 0) {
      status = 'BELUM_BAYAR';
    } else if (paid < totalAmount) {
      status = 'SEBAGIAN';
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceNo,
        receiptNo,
        memberId,
        duesTypeId,
        amount: totalAmount,
        paidAmount: paid,
        paymentMethod: paymentMethod || 'TUNAI',
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        proofUrl,
        notes,
        createdById: req.user?.id,
      },
      include: { member: true, duesType: true },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'PEMBAYARAN',
      entityId: payment.id,
      details: `Input pembayaran Rp ${paid.toLocaleString('id-ID')} untuk anggota ${member.fullName} (${member.nia}) - Invoice: ${invoiceNo}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Pencatatan pembayaran berhasil disimpan.',
      data: payment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function cancelPayment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({ where: { id }, include: { member: true } });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan.' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'BATAL' },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'PEMBAYARAN_BATAL',
      entityId: id,
      details: `Membatalkan transaksi invoice ${payment.invoiceNo} anggota ${payment.member.fullName}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Transaksi pembayaran berhasil dibatalkan.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

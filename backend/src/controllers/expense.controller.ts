import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getExpenses(req: AuthRequest, res: Response) {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category) where.category = String(category);

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });

    return res.json({ success: true, data: expenses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createExpense(req: AuthRequest, res: Response) {
  try {
    const { title, category, amount, expenseDate, recipient, notes, receiptUrl } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Judul dan jumlah nominal pengeluaran wajib diisi.' });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        category: category || 'OPERASIONAL',
        amount: Number(amount),
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        recipient,
        notes,
        receiptUrl,
        createdById: req.user?.id,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'PENGELUARAN',
      entityId: expense.id,
      details: `Pencatatan pengeluaran: ${title} sebesar Rp ${Number(amount).toLocaleString('id-ID')}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Pengeluaran berhasil dicatat.', data: expense });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteExpense(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Data pengeluaran tidak ditemukan.' });
    }

    await prisma.expense.delete({ where: { id } });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'PENGELUARAN',
      entityId: id,
      details: `Menghapus pengeluaran: ${expense.title}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Pengeluaran berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function getInventory(req: AuthRequest, res: Response) {
  try {
    const items = await prisma.inventory.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: items });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createInventory(req: AuthRequest, res: Response) {
  try {
    const { name, category, stock, unit, unitPrice, condition, location, notes } = req.body;

    if (!name || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Nama barang dan jumlah stok wajib diisi.' });
    }

    const count = await prisma.inventory.count();
    const code = `INV-${String(count + 1).padStart(3, '0')}`;

    const item = await prisma.inventory.create({
      data: {
        code,
        name,
        category: category || 'PERALATAN',
        stock: Number(stock),
        unit: unit || 'Pcs',
        unitPrice: Number(unitPrice) || 0,
        condition: condition || 'BAIK',
        location,
        notes,
      },
    });

    return res.status(201).json({ success: true, message: 'Barang inventaris berhasil ditambahkan.', data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateInventoryStock(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { stock, condition, notes } = req.body;

    const item = await prisma.inventory.update({
      where: { id },
      data: {
        stock: stock !== undefined ? Number(stock) : undefined,
        condition: condition || undefined,
        notes: notes || undefined,
      },
    });

    return res.json({ success: true, message: 'Stok inventaris diperbarui.', data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

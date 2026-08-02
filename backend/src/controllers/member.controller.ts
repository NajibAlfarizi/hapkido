import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getMembers(req: AuthRequest, res: Response) {
  try {
    const { search, status, beltId, dojangId } = req.query;

    const where: any = {};
    if (status) {
      where.status = String(status);
    }
    if (beltId) {
      where.currentBeltId = String(beltId);
    }
    if (dojangId) {
      where.dojangId = String(dojangId);
    }
    if (search) {
      const s = String(search);
      where.OR = [
        { fullName: { contains: s } },
        { nia: { contains: s } },
        { phone: { contains: s } },
        { parentName: { contains: s } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        dojang: true,
        beltHistory: {
          include: { beltLevel: true },
          orderBy: { examDate: 'desc' },
        },
      },
    });

    const beltLevels = await prisma.beltLevel.findMany();
    const beltMap = new Map(beltLevels.map((b) => [b.id, b]));

    const enrichedMembers = members.map((m) => ({
      ...m,
      currentBelt: m.currentBeltId ? beltMap.get(m.currentBeltId) : null,
    }));

    return res.json({ success: true, data: enrichedMembers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMemberById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        dojang: true,
        beltHistory: {
          include: { beltLevel: true },
          orderBy: { examDate: 'desc' },
        },
        payments: {
          include: { duesType: true },
          orderBy: { createdAt: 'desc' },
        },
        attendance: {
          include: { session: { include: { schedule: true } } },
          orderBy: { checkInTime: 'desc' },
          take: 20,
        },
        eventRegs: {
          include: { event: true },
          orderBy: { registrationDate: 'desc' },
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    let currentBelt = null;
    if (member.currentBeltId) {
      currentBelt = await prisma.beltLevel.findUnique({ where: { id: member.currentBeltId } });
    }

    return res.json({
      success: true,
      data: {
        ...member,
        currentBelt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createMember(req: AuthRequest, res: Response) {
  try {
    const {
      dojangId,
      fullName,
      nickname,
      gender,
      birthPlace,
      birthDate,
      phone,
      email,
      address,
      parentName,
      parentPhone,
      parentJob,
      emergencyContact,
      currentBeltId,
      photoUrl,
    } = req.body;

    if (!fullName || !gender) {
      return res.status(400).json({ success: false, message: 'Nama lengkap dan jenis kelamin wajib diisi.' });
    }

    let dojangCode = 'HKD';
    if (dojangId) {
      const dj = await prisma.dojang.findUnique({ where: { id: dojangId } });
      if (dj) dojangCode = dj.code;
    }

    // Auto Generate NIA format: HKD-[CODE]-YYYY-XXX
    const currentYear = new Date().getFullYear();
    const count = await prisma.member.count({
      where: dojangId ? { dojangId } : undefined,
    });
    const seq = String(count + 1).padStart(3, '0');
    const nia = `HKD-${dojangCode}-${currentYear}-${seq}`;

    // Get default white belt if not specified
    let beltIdToUse = currentBeltId;
    if (!beltIdToUse) {
      const whiteBelt = await prisma.beltLevel.findFirst({ where: { geupRank: 10 } });
      beltIdToUse = whiteBelt?.id;
    }

    const member = await prisma.member.create({
      data: {
        nia,
        dojangId: dojangId || null,
        fullName,
        nickname,
        gender: gender || 'LAKILAKI',
        birthPlace,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone,
        email,
        address,
        parentName,
        parentPhone,
        parentJob,
        emergencyContact,
        currentBeltId: beltIdToUse,
        photoUrl,
        status: 'AKTIF',
      },
      include: { dojang: true },
    });

    // Record initial belt history
    if (beltIdToUse) {
      await prisma.memberBeltHistory.create({
        data: {
          memberId: member.id,
          beltLevelId: beltIdToUse,
          examDate: new Date(),
          notes: 'Sabuk awal saat pendaftaran',
        },
      });
    }

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'ANGGOTA',
      entityId: member.id,
      details: `Menambah anggota baru ${member.fullName} (NIA: ${member.nia}) pada Dojang ${dojangCode}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Anggota berhasil ditambahkan.', data: member });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateMember(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      dojangId,
      fullName,
      nickname,
      gender,
      birthPlace,
      birthDate,
      phone,
      email,
      address,
      status,
      parentName,
      parentPhone,
      parentJob,
      emergencyContact,
      currentBeltId,
      photoUrl,
    } = req.body;

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        dojangId: dojangId !== undefined ? dojangId : existing.dojangId,
        fullName,
        nickname,
        gender,
        birthPlace,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        phone,
        email,
        address,
        status,
        parentName,
        parentPhone,
        parentJob,
        emergencyContact,
        currentBeltId,
        photoUrl,
      },
      include: { dojang: true },
    });

    // If belt level updated, append to belt history if not existing
    if (currentBeltId && currentBeltId !== existing.currentBeltId) {
      await prisma.memberBeltHistory.create({
        data: {
          memberId: updated.id,
          beltLevelId: currentBeltId,
          examDate: new Date(),
          notes: 'Penaikan sabuk via pembaruan profil anggota oleh admin',
        },
      });
    }

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'ANGGOTA',
      entityId: id,
      details: `Memperbarui data anggota ${updated.fullName} (NIA: ${updated.nia})`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Data anggota berhasil diperbarui.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteMember(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    await prisma.member.delete({ where: { id } });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'ANGGOTA',
      entityId: id,
      details: `Menghapus data anggota ${member.fullName} (NIA: ${member.nia})`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Data anggota berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

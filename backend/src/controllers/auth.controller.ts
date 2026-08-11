import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'hapkido_dojang_secret_key_2026_super_secure';
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Username atau password salah.' });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({ success: false, message: 'Akun Anda masih dalam proses persetujuan (approval) Admin Dojang.' });
    }

    if (user.status === 'NONAKTIF') {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: `User ${user.username} berhasil login dengan role ${user.role}`,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        trainer: {
          select: {
            id: true,
            specialty: true,
            bio: true,
            isHead: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(444).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan password baru wajib diisi.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE',
      entity: 'USER_PASSWORD',
      entityId: user.id,
      details: 'Pengguna mengubah password akun',
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function resetPasswordAdmin(req: AuthRequest, res: Response) {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'userId dan newPassword wajib diisi.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User target tidak ditemukan.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'RESET_PASSWORD',
      entityId: userId,
      details: `Admin mereset password user ${targetUser.username}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: `Password user ${targetUser.username} berhasil di-reset.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function registerParent(req: AuthRequest, res: Response) {
  try {
    const { name, username, password, phone, email } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: 'Nama, username, dan password wajib diisi.' });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        phone: phone || null,
        email: email || null,
        role: 'ORANG_TUA',
        status: 'PENDING',
      },
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: 'ORANG_TUA',
      action: 'CREATE',
      entity: 'USER_ORANG_TUA',
      entityId: user.id,
      details: `Registrasi orang tua baru: ${user.name} (${user.username}), menunggu persetujuan admin`,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Akun Anda telah dibuat dan menunggu persetujuan (approval) dari Admin Dojang.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

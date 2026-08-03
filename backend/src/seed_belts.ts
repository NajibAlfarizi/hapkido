import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function seedBelts() {
  console.log('🥋 Seeding official Hapkido Geup & DAN belt levels into Neon PostgreSQL database...');

  const beltLevels = [
    {
      name: 'Sabuk Putih (Geup 10)',
      geupRank: 10,
      badgeColor: '#E2E8F0', // Putih
      examFeeDefault: 100000,
      requirements: 'Sabuk Putih (Pemula) - Teknik dasar kuda-kuda (Juchum Seogi), pukulan (Jireugi), & tendangan depan (Ap Chagi).',
    },
    {
      name: 'Sabuk Kuning (Geup 9)',
      geupRank: 9,
      badgeColor: '#FACC15', // Kuning
      examFeeDefault: 125000,
      requirements: 'Sabuk Kuning - Teknik jatuhan (Nakbop) & Kuncian pergelangan tangan (Hoshinsool 1-5).',
    },
    {
      name: 'Sabuk Oranye / Kuning Strip (Geup 8)',
      geupRank: 8,
      badgeColor: '#F97316', // Oranye
      examFeeDefault: 150000,
      requirements: 'Sabuk Oranye / Kuning Strip - Tendangan memutar (Dollyo Chagi), Hoshinsool tangkapan pakaian.',
    },
    {
      name: 'Sabuk Hijau (Geup 7)',
      geupRank: 7,
      badgeColor: '#22C55E', // Hijau
      examFeeDefault: 175000,
      requirements: 'Sabuk Hijau - Tendangan samping (Yop Chagi), tangkapan dua tangan & kuncian siku.',
    },
    {
      name: 'Sabuk Hijau Strip / Ungu (Geup 6)',
      geupRank: 6,
      badgeColor: '#A855F7', // Ungu / Hijau Strip
      examFeeDefault: 200000,
      requirements: 'Sabuk Hijau Strip / Ungu - Kuncian pergelangan silang, pelepasan cekikan dari belakang.',
    },
    {
      name: 'Sabuk Biru (Geup 5)',
      geupRank: 5,
      badgeColor: '#3B82F6', // Biru
      examFeeDefault: 225000,
      requirements: 'Sabuk Biru - Tendangan belakang (Dwit Chagi), Hoshinsool tangkapan bahu & leher.',
    },
    {
      name: 'Sabuk Biru Strip / Cokelat Muda (Geup 4)',
      geupRank: 4,
      badgeColor: '#D97706', // Cokelat Muda / Biru Strip
      examFeeDefault: 250000,
      requirements: 'Sabuk Biru Strip / Cokelat Muda - Kombinasi tendangan melompat (Twimyo Chagi), bantingan Hapkido.',
    },
    {
      name: 'Sabuk Cokelat (Geup 3)',
      geupRank: 3,
      badgeColor: '#78350F', // Cokelat
      examFeeDefault: 275000,
      requirements: 'Sabuk Cokelat - Tangkapan serangkaian kuncian (Sambeop), takedown & bantingan dasar.',
    },
    {
      name: 'Sabuk Merah (Geup 2)',
      geupRank: 2,
      badgeColor: '#EF4444', // Merah
      examFeeDefault: 300000,
      requirements: 'Sabuk Merah - Tangkapan pisau/senjata tajam, Hoshinsool tingkat lanjut.',
    },
    {
      name: 'Sabuk Merah Strip Hitam (Geup 1)',
      geupRank: 1,
      badgeColor: '#991B1B', // Merah Strip Hitam
      examFeeDefault: 350000,
      requirements: 'Sabuk Merah Strip Hitam - Persiapan Dan 1, kombinasi 3 tendangan udara, Sparring (pertarungan bebas).',
    },

    // ===== JENJANG TINGKATAN DAN (SABUK HITAM) =====
    {
      name: 'Sabuk Hitam - Il Dan (Dan 1)',
      geupRank: 0,
      badgeColor: '#0F172A', // Hitam
      examFeeDefault: 500000,
      requirements: 'Il Dan (Dan 1): Tingkat pemula sabuk hitam, fokus pada pemantapan teknik dasar dan lanjutan.',
    },
    {
      name: 'Sabuk Hitam - Ee Dan (Dan 2)',
      geupRank: -1,
      badgeColor: '#0F172A', // Hitam
      examFeeDefault: 650000,
      requirements: 'Ee Dan (Dan 2): Tingkat pemula sabuk hitam, fokus pada pemantapan teknik dasar dan lanjutan.',
    },
    {
      name: 'Sabuk Hitam - Sam Dan (Dan 3)',
      geupRank: -2,
      badgeColor: '#0F172A', // Hitam
      examFeeDefault: 850000,
      requirements: 'Sam Dan (Dan 3): Tingkat menengah, di mana pemegang sabuk mulai diakui sebagai instruktur atau pelatih (Sasaeng/Kwanjang).',
    },
    {
      name: 'Sabuk Hitam - Sa Dan (Dan 4)',
      geupRank: -3,
      badgeColor: '#0F172A', // Hitam
      examFeeDefault: 1000000,
      requirements: 'Sa Dan (Dan 4): Tingkat menengah, di mana pemegang sabuk mulai diakui sebagai instruktur atau pelatih (Sasaeng/Kwanjang).',
    },
    {
      name: 'Sabuk Hitam - O Dan Ke Atas / Grandmaster (Dan 5+)',
      geupRank: -4,
      badgeColor: '#0F172A', // Hitam
      examFeeDefault: 1500000,
      requirements: 'O Dan (Dan 5) ke atas: Tingkat mahir, tingkat tinggi, hingga Grandmaster (Dan 9/10) yang dipegang oleh tokoh sesepuh organisasi.',
    },
  ];

  for (const b of beltLevels) {
    const existing = await prisma.beltLevel.findFirst({ where: { geupRank: b.geupRank } });
    if (existing) {
      await prisma.beltLevel.update({
        where: { id: existing.id },
        data: {
          name: b.name,
          badgeColor: b.badgeColor,
          examFeeDefault: b.examFeeDefault,
          requirements: b.requirements,
        },
      });
      console.log(`✨ Updated: ${b.name} (${b.badgeColor})`);
    } else {
      await prisma.beltLevel.create({ data: b });
      console.log(`➕ Created: ${b.name} (${b.badgeColor})`);
    }
  }

  console.log('✅ All Hapkido Geup & DAN belt levels successfully synced with Neon PostgreSQL DB!');
}

seedBelts()
  .catch((e) => {
    console.error('❌ Error seeding belts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

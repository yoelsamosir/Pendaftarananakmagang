import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@balailayananperpustakaan.go.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(adminPassword, 10),
      },
    });
    console.log(`Admin dibuat: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Admin sudah ada, dilewati.");
  }

  const divisionNames = ["Layanan Sirkulasi", "Pengolahan Bahan Pustaka", "Teknologi Informasi", "Administrasi Umum"];
  for (const name of divisionNames) {
    await prisma.division.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const roomNames = ["Ruang IT 1", "Ruang IT 2", "Ruang Meeting"];
  for (const name of roomNames) {
    await prisma.room.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Gagal mencari user: ${error.message}`);
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@balailayananperpustakaan.go.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  let authUser = await findAuthUserByEmail(adminEmail);
  if (!authUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: "Administrator", role: "ADMIN" },
    });
    if (error || !data.user) throw new Error(`Gagal membuat admin: ${error?.message}`);
    authUser = data.user;
    console.log(`Admin dibuat di Supabase Auth: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Admin sudah ada di Supabase Auth, dilewati.");
  }

  await prisma.user.upsert({
    where: { id: authUser.id },
    update: { email: adminEmail, name: "Administrator", role: "ADMIN", isActive: true },
    create: {
      id: authUser.id,
      email: adminEmail,
      name: "Administrator",
      role: "ADMIN",
    },
  });

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

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "documents")) {
    const { error } = await supabaseAdmin.storage.createBucket("documents", { public: false });
    if (error) throw new Error(`Gagal membuat bucket storage: ${error.message}`);
    console.log("Bucket storage 'documents' dibuat.");
  } else {
    console.log("Bucket storage 'documents' sudah ada, dilewati.");
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

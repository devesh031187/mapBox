import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@hotel.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";

  const hotel = await prisma.hotelProfile.findFirst();
  if (!hotel) {
    await prisma.hotelProfile.create({
      data: {
        legalName: "Grand Continental Hotels Pvt Ltd",
        brandName: "Grand Continental",
        baseCurrency: "INR",
        updatedBy: "00000000-0000-0000-0000-000000000000",
      },
    });
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        employeeCode: "EMP-0001",
        fullName: "System Administrator",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    // eslint-disable-next-line no-console
    console.log(`Seeded admin user: ${adminEmail}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  const defaultRankingConfig = await prisma.vendorRankingConfig.findFirst();
  if (!defaultRankingConfig) {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (admin) {
      await prisma.vendorRankingConfig.create({
        data: { configName: "Default", updatedBy: admin.id },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

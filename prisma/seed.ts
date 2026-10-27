import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log("Seeding roles...");
  const roles = ["Admin", "Member", "Guest"];
  const createdRoles = await Promise.all(
    roles.map((roleName) =>
      prisma.role.create({
        data: {
          name: roleName,
          description: `${roleName} role for the system`,
        },
      })
    )
  );

  console.log("Seeding users...");
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          roleId: faker.helpers.arrayElement(createdRoles).id,
        },
      })
    )
  );

  console.log("Seeding transactions...");
  await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.transaction.create({
        data: {
          amount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
          currency: "USD",
          status: faker.helpers.arrayElement(["PENDING", "COMPLETED", "FAILED"]),
          userId: faker.helpers.arrayElement(users).id,
        },
      })
    )
  );

  console.log("Seeding audit logs...");
  await Promise.all(
    Array.from({ length: 15 }).map(() =>
      prisma.auditLog.create({
        data: {
          action: faker.helpers.arrayElement(["USER_LOGIN", "DATA_EXPORT", "SETTINGS_UPDATED"]),
          entityId: faker.string.uuid(),
          entityType: "System",
          userId: faker.helpers.arrayElement(users).id,
          metadata: JSON.stringify({ ip: faker.internet.ip() }),
        },
      })
    )
  );

  console.log("Seeding complete! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth-utils";

// const prisma = new PrismaClient(); // Removed local instantiation

async function main() {
    console.log("Seeding database...");

    // Organizations
    const orgs = [
        { name: "Tech Corp", type: "Technology" },
        { name: "Health Plus", type: "Healthcare" },
        { name: "Edu World", type: "Education" },
    ];

    for (const orgData of orgs) {
        const existingOrg = await prisma.organization.findFirst({
            where: { name: orgData.name },
        });

        if (!existingOrg) {
            await prisma.organization.create({
                data: {
                    name: orgData.name,
                    type: orgData.type,
                },
            });
            console.log(`Created organization: ${orgData.name}`);
        } else {
            console.log(`Organization already exists: ${orgData.name}`);
        }
    }

    // Create default roles/users if needed?
    // User asked for "dynamic users Admin, Manager". 
    // I will create one of each for easier testing.

    const roles = ["admin", "manager", "user", "staff"];
    // We need an organization ID to assign to these users.
    const org = await prisma.organization.findFirst();

    if (org) {
        for (const role of roles) {
            const email = `${role}@example.com`;
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        email,
                        password: await hashPassword("password123"),
                        name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
                        role: role,
                        organizationId: org.organizationId
                    }
                });
                console.log(`Created user: ${email} with role ${role}`);
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

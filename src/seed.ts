import prisma from "./lib/prisma.js";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed cannot run in production.");
  }

  const [database] = await prisma.$queryRaw<Array<{ databaseName: string }>>`
    SELECT current_database() AS "databaseName"
  `;

  if (database?.databaseName !== "hospital_api") {
    const databaseName = database?.databaseName ?? "unknown";
    throw new Error(
      `The seed can only reset the hospital_api database; connected to "${databaseName}".`,
    );
  }

  await prisma.$transaction(
    async (transaction) => {
      await transaction.appointment.deleteMany();
      await transaction.patient.deleteMany();
      await transaction.doctor.deleteMany();

      const drPriya = await transaction.doctor.create({
        data: {
          name: "Dr. Priya Sharma",
          specialty: "Cardiology",
          email: "priya.sharma@hospital.io",
        },
      });

      const drVikram = await transaction.doctor.create({
        data: {
          name: "Dr. Vikram Rao",
          specialty: "Neurology",
          email: "vikram.rao@hospital.io",
        },
      });

      const aditi = await transaction.patient.create({
        data: {
          name: "Aditi Mehra",
          email: "aditi@example.com",
          phone: "9876543210",
          dateOfBirth: new Date("1990-04-12"),
        },
      });

      const rahul = await transaction.patient.create({
        data: { name: "Rahul Singh", email: "rahul@example.com" },
      });

      await transaction.appointment.createMany({
        data: [
          {
            patientId: aditi.id,
            doctorId: drPriya.id,
            appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "scheduled",
            notes: "Annual cardiac checkup",
          },
          {
            patientId: rahul.id,
            doctorId: drVikram.id,
            appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
            status: "scheduled",
            notes: "Neurology consultation",
          },
        ],
      });

      const [doctorCount, patientCount, appointmentCount] = await Promise.all([
        transaction.doctor.count(),
        transaction.patient.count(),
        transaction.appointment.count(),
      ]);

      console.log("Seed complete:");
      console.log(" Doctors:", doctorCount);
      console.log(" Patients:", patientCount);
      console.log(" Appointments:", appointmentCount);
    },
    { timeout: 10_000 },
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

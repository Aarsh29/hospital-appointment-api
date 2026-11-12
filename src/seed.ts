import prisma from "./lib/prisma.js";

async function ensureAppointment(
  patientId: number,
  doctorId: number,
  date: Date,
  notes: string,
) {
  const existing = await prisma.appointment.findFirst({
    where: { patientId, doctorId, notes },
  });

  if (existing !== null) {
    return existing;
  }

  return prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      appointmentDate: date,
      status: "scheduled",
      notes,
    },
  });
}

async function main() {
  const drPriya = await prisma.doctor.upsert({
    where: { email: "priya.sharma@hospital.io" },
    update: { name: "Dr. Priya Sharma", specialty: "Cardiology" },
    create: {
      name: "Dr. Priya Sharma",
      specialty: "Cardiology",
      email: "priya.sharma@hospital.io",
    },
  });

  const drVikram = await prisma.doctor.upsert({
    where: { email: "vikram.rao@hospital.io" },
    update: { name: "Dr. Vikram Rao", specialty: "Neurology" },
    create: {
      name: "Dr. Vikram Rao",
      specialty: "Neurology",
      email: "vikram.rao@hospital.io",
    },
  });

  const aditi = await prisma.patient.upsert({
    where: { email: "aditi@example.com" },
    update: {
      name: "Aditi Mehra",
      phone: "9876543210",
      dateOfBirth: new Date("1990-04-12"),
    },
    create: {
      name: "Aditi Mehra",
      email: "aditi@example.com",
      phone: "9876543210",
      dateOfBirth: new Date("1990-04-12"),
    },
  });

  const rahul = await prisma.patient.upsert({
    where: { email: "rahul@example.com" },
    update: { name: "Rahul Singh" },
    create: { name: "Rahul Singh", email: "rahul@example.com" },
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await ensureAppointment(
    aditi.id,
    drPriya.id,
    tomorrow,
    "Seed: annual cardiac checkup",
  );
  await ensureAppointment(
    rahul.id,
    drVikram.id,
    dayAfterTomorrow,
    "Seed: neurology consultation",
  );

  console.log("Seed complete:");
  console.log(" Doctors:", 2);
  console.log(" Patients:", 2);
  console.log(" Appointments:", 2);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

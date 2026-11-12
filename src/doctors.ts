import prisma from "./lib/prisma.js";

export async function createDoctor(data: {
  name: string;
  specialty: string;
  email: string;
}) {
  return prisma.doctor.create({ data });
}

export async function getDoctor(id: number) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });

  if (doctor === null) {
    throw new Error("Doctor not found");
  }

  return doctor;
}

export async function listDoctorsBySpecialty(specialty: string) {
  return prisma.doctor.findMany({
    where: { specialty: { contains: specialty } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, specialty: true, email: true },
  });
}

export async function deleteDoctor(id: number) {
  try {
    return await prisma.doctor.delete({ where: { id } });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2003"
    ) {
      throw new Error(
        "Cannot delete a doctor with appointments; delete or reassign the appointments first.",
        { cause: error },
      );
    }

    throw error;
  }
}

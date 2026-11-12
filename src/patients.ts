import prisma from "./lib/prisma.js";

export async function createPatient(data: {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
}) {
  return prisma.patient.create({ data });
}

export async function getPatient(id: number) {
  const patient = await prisma.patient.findUnique({ where: { id } });

  if (patient === null) {
    throw new Error("Patient not found");
  }

  return patient;
}

export async function searchPatients(nameFragment: string) {
  return prisma.patient.findMany({
    where: { name: { contains: nameFragment } },
    orderBy: { name: "asc" },
  });
}

export async function updatePatientPhone(id: number, phone: string) {
  return prisma.patient.update({ where: { id }, data: { phone } });
}

export async function deletePatient(id: number) {
  return prisma.patient.delete({ where: { id } });
}

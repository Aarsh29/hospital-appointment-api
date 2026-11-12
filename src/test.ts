import prisma from "./lib/prisma.js";
import {
  bookAppointment,
  cancelAllPatientAppointments,
  deleteAppointment,
  getAppointmentFull,
  getDoctorUpcomingAppointments,
  setAppointmentStatus,
} from "./appointments.js";
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  listDoctorsBySpecialty,
} from "./doctors.js";
import {
  createPatient,
  deletePatient,
  getPatient,
  searchPatients,
  updatePatientPhone,
} from "./patients.js";

async function main() {
  let patientId: number | undefined;
  let doctorId: number | undefined;
  const appointmentIds: number[] = [];

  try {
    console.log("\n── Patients ──────────────────────────");

    const suffix = `${Date.now()}`;
    const patient = await createPatient({
      name: `Test Patient ${suffix}`,
      email: `test.patient.${suffix}@example.com`,
      phone: "9999999999",
    });
    patientId = patient.id;
    console.log("Created:", patient.name, patient.id);

    const foundPatient = await getPatient(patient.id);
    console.log("Found:", foundPatient.name);

    const updatedPatient = await updatePatientPhone(patient.id, "8888888888");
    console.log("Updated phone:", updatedPatient.phone);

    const patientResults = await searchPatients(`Test Patient ${suffix}`);
    console.log("Search results:", patientResults.length);

    console.log("\n── Doctors ───────────────────────────");

    const doctor = await createDoctor({
      name: `Dr. Test ${suffix}`,
      specialty: "General Medicine",
      email: `dr.test.${suffix}@hospital.io`,
    });
    doctorId = doctor.id;
    console.log("Created:", doctor.name, doctor.id);

    const foundDoctor = await getDoctor(doctor.id);
    console.log("Found:", foundDoctor.name);

    const specialists = await listDoctorsBySpecialty("General Medicine");
    console.log("General Medicine doctors:", specialists.length);

    console.log("\n── Appointments ──────────────────────");

    const firstDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const firstAppointment = await bookAppointment(
      patient.id,
      doctor.id,
      firstDate,
      "Initial consultation",
    );
    appointmentIds.push(firstAppointment.id);
    console.log(
      "Booked:",
      firstAppointment.id,
      "for",
      firstAppointment.patient.name,
    );

    const secondAppointment = await bookAppointment(
      patient.id,
      doctor.id,
      new Date(Date.now() + 48 * 60 * 60 * 1000),
      "Follow-up consultation",
    );
    appointmentIds.push(secondAppointment.id);

    const fullAppointment = await getAppointmentFull(firstAppointment.id);
    console.log(
      "Full fetch:",
      fullAppointment.patient.name,
      "with",
      fullAppointment.doctor.name,
    );

    const schedule = await getDoctorUpcomingAppointments(doctor.id);
    console.log("Doctor schedule:", schedule.length, "appointment(s)");

    const updatedAppointment = await setAppointmentStatus(
      firstAppointment.id,
      "cancelled",
    );
    console.log("Status updated to:", updatedAppointment.status);

    const cancelledCount = await cancelAllPatientAppointments(patient.id);
    console.log("Additional appointments cancelled:", cancelledCount);

    console.log("\n── Cleanup ───────────────────────────");
    for (const appointmentId of appointmentIds) {
      await deleteAppointment(appointmentId);
    }
    appointmentIds.length = 0;

    await deletePatient(patient.id);
    patientId = undefined;

    await deleteDoctor(doctor.id);
    doctorId = undefined;
    console.log("Test data cleaned up.");
  } finally {
    if (appointmentIds.length > 0) {
      await prisma.appointment.deleteMany({
        where: { id: { in: appointmentIds } },
      });
    }

    if (patientId !== undefined) {
      await deletePatient(patientId);
    }

    if (doctorId !== undefined) {
      await deleteDoctor(doctorId);
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error("CRUD test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

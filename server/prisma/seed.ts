import { PrismaClient, UserRole, StaffRole, AccountStatus, Gender, CivilStatus, PatientStatus, AppointmentStatus, ConsultationType, ConsultationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Barangays
  const barangays = await Promise.all([
    prisma.barangay.upsert({
      where: { name: 'Asinan' },
      update: {},
      create: { name: 'Asinan', zipCode: '2200' },
    }),
    prisma.barangay.upsert({
      where: { name: 'Banicain' },
      update: {},
      create: { name: 'Banicain', zipCode: '2200' },
    }),
    prisma.barangay.upsert({
      where: { name: 'Barretto' },
      update: {},
      create: { name: 'Barretto', zipCode: '2200' },
    }),
    prisma.barangay.upsert({
      where: { name: 'East Bajac-Bajac' },
      update: {},
      create: { name: 'East Bajac-Bajac', zipCode: '2200' },
    }),
    prisma.barangay.upsert({
      where: { name: 'East Tapinac' },
      update: {},
      create: { name: 'East Tapinac', zipCode: '2200' },
    }),
    prisma.barangay.upsert({
      where: { name: 'Gordon Heights' },
      update: {},
      create: { name: 'Gordon Heights', zipCode: '2200' },
    }),
  ]);
  console.log(`✅ Created ${barangays.length} barangays`);

  // Create Stations
  const stations = await Promise.all([
    prisma.station.upsert({
      where: { name: 'Main Health Center' },
      update: {},
      create: {
        name: 'Main Health Center',
        address: 'Olongapo City Hall, Olongapo City',
        contact: '047-222-1234',
      },
    }),
    prisma.station.upsert({
      where: { name: 'Barangay Health Station - Asinan' },
      update: {},
      create: {
        name: 'Barangay Health Station - Asinan',
        address: 'Asinan, Olongapo City',
        contact: '047-222-5678',
      },
    }),
    prisma.station.upsert({
      where: { name: 'Barangay Health Station - East Bajac-Bajac' },
      update: {},
      create: {
        name: 'Barangay Health Station - East Bajac-Bajac',
        address: 'East Bajac-Bajac, Olongapo City',
        contact: '047-222-7890',
      },
    }),
  ]);
  console.log(`✅ Created ${stations.length} stations`);

  // Create Staff (using StaffRole enum)
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { email: 'dr.santos@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Santos',
        role: StaffRole.Doctor,
        licenseNumber: 'PRC-MD-2020-001234',
        contact: '0917-123-4567',
        email: 'dr.santos@healthwatch.ph',
        accountStatus: AccountStatus.Active,
        stationId: stations[0].id,
      },
    }),
    prisma.staff.upsert({
      where: { email: 'nurse.cruz@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Juan',
        lastName: 'Cruz',
        role: StaffRole.Nurse,
        licenseNumber: 'PRC-RN-2019-005678',
        contact: '0918-234-5678',
        email: 'nurse.cruz@healthwatch.ph',
        accountStatus: AccountStatus.Active,
        stationId: stations[0].id,
      },
    }),
    prisma.staff.upsert({
      where: { email: 'midwife.reyes@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Ana',
        lastName: 'Reyes',
        role: StaffRole.Midwife,
        licenseNumber: 'PRC-MW-2018-009012',
        contact: '0919-345-6789',
        email: 'midwife.reyes@healthwatch.ph',
        accountStatus: AccountStatus.Active,
        stationId: stations[1].id,
      },
    }),
    // 3 NEW STAFF MEMBERS
    prisma.staff.upsert({
      where: { email: 'dr.mendoza@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Roberto',
        lastName: 'Mendoza',
        role: StaffRole.Doctor,
        licenseNumber: 'PRC-MD-2021-002345',
        contact: '0920-456-7890',
        email: 'dr.mendoza@healthwatch.ph',
        accountStatus: AccountStatus.Active,
        stationId: stations[2].id,
      },
    }),
    prisma.staff.upsert({
      where: { email: 'nurse.torres@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Elena',
        lastName: 'Torres',
        role: StaffRole.Nurse,
        licenseNumber: 'PRC-RN-2020-006789',
        contact: '0921-567-8901',
        email: 'nurse.torres@healthwatch.ph',
        accountStatus: AccountStatus.Active,
        stationId: stations[2].id,
      },
    }),
    prisma.staff.upsert({
      where: { email: 'bhw.ramos@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Carlos',
        lastName: 'Ramos',
        role: StaffRole.BHW,
        licenseNumber: null,
        contact: '0922-678-9012',
        email: 'bhw.ramos@healthwatch.ph',
        accountStatus: AccountStatus.Active,
        stationId: stations[1].id,
      },
    }),
  ]);
  console.log(`✅ Created ${staff.length} staff members`);

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@healthwatch.ph',
      password: hashedPassword,
      role: UserRole.Admin,
      accountStatus: AccountStatus.Active,
    },
  });
  console.log(`✅ Created admin user: ${adminUser.username}`);

  // Create Employee Users linked to staff
  const employeePassword = await bcrypt.hash('admin123', 12);
  const employeeUser1 = await prisma.user.upsert({
    where: { username: 'dr.santos' },
    update: {},
    create: {
      username: 'dr.santos',
      email: 'dr.santos.user@healthwatch.ph',
      password: employeePassword,
      role: UserRole.Employee,
      accountStatus: AccountStatus.Active,
      staffId: staff[0].id,
    },
  });
  console.log(`✅ Created employee user: ${employeeUser1.username}`);

  const employeeUser2 = await prisma.user.upsert({
    where: { username: 'nurse.cruz' },
    update: {},
    create: {
      username: 'nurse.cruz',
      email: 'nurse.cruz.user@healthwatch.ph',
      password: employeePassword,
      role: UserRole.Employee,
      accountStatus: AccountStatus.Active,
      staffId: staff[1].id,
    },
  });
  console.log(`✅ Created employee user: ${employeeUser2.username}`);

  // Create Sample Patients (5 total: 2 existing + 3 new)
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { id: 'patient-001' },
      update: {},
      create: {
        id: 'patient-001',
        firstName: 'Pedro',
        lastName: 'Garcia',
        dob: new Date('1985-05-15'),
        gender: Gender.Male,
        bloodType: 'O+',
        civilStatus: CivilStatus.Married,
        contact: '0920-456-7890',
        address: '123 Rizal St., Asinan',
        emergencyContact: 'Maria Garcia',
        emergencyContactNumber: '0921-567-8901',
        philhealth: '01-234567890-1',
        status: PatientStatus.Active,
        barangayId: barangays[0].id,
      },
    }),
    prisma.patient.upsert({
      where: { id: 'patient-002' },
      update: {},
      create: {
        id: 'patient-002',
        firstName: 'Rosa',
        lastName: 'Mendoza',
        dob: new Date('1990-08-22'),
        gender: Gender.Female,
        bloodType: 'A+',
        civilStatus: CivilStatus.Single,
        contact: '0922-678-9012',
        address: '456 Mabini St., Banicain',
        emergencyContact: 'Carlos Mendoza',
        emergencyContactNumber: '0923-789-0123',
        philhealth: '01-345678901-2',
        status: PatientStatus.Active,
        barangayId: barangays[1].id,
      },
    }),
    // 3 NEW PATIENTS
    prisma.patient.upsert({
      where: { id: 'patient-003' },
      update: {},
      create: {
        id: 'patient-003',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        dob: new Date('1978-03-10'),
        gender: Gender.Male,
        bloodType: 'B+',
        civilStatus: CivilStatus.Married,
        contact: '0924-890-1234',
        address: '789 Bonifacio Ave., Barretto',
        emergencyContact: 'Luisa Dela Cruz',
        emergencyContactNumber: '0925-901-2345',
        philhealth: '01-456789012-3',
        status: PatientStatus.Active,
        barangayId: barangays[2].id,
      },
    }),
    prisma.patient.upsert({
      where: { id: 'patient-004' },
      update: {},
      create: {
        id: 'patient-004',
        firstName: 'Isabel',
        lastName: 'Santos',
        dob: new Date('1995-11-30'),
        gender: Gender.Female,
        bloodType: 'AB+',
        civilStatus: CivilStatus.Single,
        contact: '0926-012-3456',
        address: '321 Luna St., East Bajac-Bajac',
        emergencyContact: 'Teresa Santos',
        emergencyContactNumber: '0927-123-4567',
        philhealth: '01-567890123-4',
        status: PatientStatus.Active,
        barangayId: barangays[3].id,
      },
    }),
    prisma.patient.upsert({
      where: { id: 'patient-005' },
      update: {},
      create: {
        id: 'patient-005',
        firstName: 'Miguel',
        lastName: 'Reyes',
        dob: new Date('2010-06-18'),
        gender: Gender.Male,
        bloodType: 'O-',
        civilStatus: CivilStatus.Single,
        contact: '0928-234-5678',
        address: '654 Del Pilar St., Gordon Heights',
        emergencyContact: 'Carmen Reyes',
        emergencyContactNumber: '0929-345-6789',
        philhealth: '01-678901234-5',
        status: PatientStatus.Active,
        barangayId: barangays[5].id,
      },
    }),
  ]);
  console.log(`✅ Created ${patients.length} sample patients`);

  // Create Sample Medical Conditions
  await Promise.all([
    prisma.medicalCondition.create({
      data: {
        condition: 'Hypertension',
        status: 'Active',
        notes: 'Patient managing with medication for 3 years',
        diagnosedDate: new Date('2021-04-01'),
        patientId: patients[0].id,
      },
    }),
    prisma.medicalCondition.create({
      data: {
        condition: 'Type 2 Diabetes',
        status: 'Active',
        notes: 'Controlled with diet and medication',
        diagnosedDate: new Date('2020-07-15'),
        patientId: patients[2].id,
      },
    }),
  ]);
  console.log(`✅ Created sample medical conditions`);

  // Create Sample Appointments
  await Promise.all([
    prisma.appointment.create({
      data: {
        scheduledDate: new Date('2026-04-10T09:00:00'),
        purpose: 'Regular checkup',
        status: AppointmentStatus.Confirmed,
        notes: 'Annual physical examination',
        patientId: patients[0].id,
        staffId: staff[0].id,
      },
    }),
    prisma.appointment.create({
      data: {
        scheduledDate: new Date('2026-04-12T14:00:00'),
        purpose: 'Follow-up consultation',
        status: AppointmentStatus.Pending,
        notes: 'Blood sugar monitoring',
        patientId: patients[2].id,
        staffId: staff[3].id,
      },
    }),
    prisma.appointment.create({
      data: {
        scheduledDate: new Date('2026-04-15T10:30:00'),
        purpose: 'Prenatal checkup',
        status: AppointmentStatus.Confirmed,
        notes: 'Second trimester checkup',
        patientId: patients[3].id,
        staffId: staff[2].id,
      },
    }),
  ]);
  console.log(`✅ Created sample appointments`);

  // Create Sample Consultations with Vital Signs and Prescriptions
  const consultation1 = await prisma.consultation.create({
    data: {
      date: new Date('2026-04-05T10:00:00'),
      chiefComplaint: 'Elevated blood pressure',
      symptoms: 'Headache, dizziness, blurred vision',
      diagnosis: 'Uncontrolled Hypertension',
      icdCode: 'I10',
      type: ConsultationType.Regular,
      status: ConsultationStatus.Completed,
      notes: 'Blood pressure 160/100. Adjusted medication dosage.',
      patientId: patients[0].id,
      staffId: staff[0].id,
    },
  });

  await prisma.vitalSigns.create({
    data: {
      date: new Date('2026-04-05T10:00:00'),
      bpSystolic: 160,
      bpDiastolic: 100,
      pulseRate: 82,
      respRate: 18,
      temperature: 36.5,
      weight: 75.5,
      height: 168.0,
      bmi: 26.7,
      consultId: consultation1.id,
      patientId: patients[0].id,
    },
  });

  await prisma.prescription.create({
    data: {
      date: new Date('2026-04-05T10:30:00'),
      medicine: 'Amlodipine 10mg',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take one tablet every morning after breakfast',
      consultId: consultation1.id,
      patientId: patients[0].id,
      doctorId: staff[0].id,
    },
  });

  console.log(`✅ Created sample consultation with vital signs and prescription`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Barangays: ${barangays.length}`);
  console.log(`  - Stations: ${stations.length}`);
  console.log(`  - Staff: ${staff.length}`);
  console.log(`  - Users: 3 (1 admin, 2 employees)`);
  console.log(`  - Patients: ${patients.length}`);
  console.log('\n🔑 Login credentials:');
  console.log(`  Username: admin / Password: admin123`);
  console.log(`  Username: dr.santos / Password: admin123`);
  console.log(`  Username: nurse.cruz / Password: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

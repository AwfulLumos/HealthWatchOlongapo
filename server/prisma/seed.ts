import { PrismaClient, UserRole, AccountStatus, Gender, CivilStatus } from '@prisma/client';
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
  ]);
  console.log(`✅ Created ${stations.length} stations`);

  // Create Staff
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { email: 'dr.santos@healthwatch.ph' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Santos',
        role: UserRole.Doctor,
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
        role: UserRole.Nurse,
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
        role: UserRole.Midwife,
        licenseNumber: 'PRC-MW-2018-009012',
        contact: '0919-345-6789',
        email: 'midwife.reyes@healthwatch.ph',
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

  // Create Doctor User linked to staff
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctorUser = await prisma.user.upsert({
    where: { username: 'dr.santos' },
    update: {},
    create: {
      username: 'dr.santos',
      email: 'dr.santos.user@healthwatch.ph',
      password: doctorPassword,
      role: UserRole.Doctor,
      accountStatus: AccountStatus.Active,
      staffId: staff[0].id,
    },
  });
  console.log(`✅ Created doctor user: ${doctorUser.username}`);

  // Create Sample Patients
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
        barangayId: barangays[1].id,
      },
    }),
  ]);
  console.log(`✅ Created ${patients.length} sample patients`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { CreatePatientInput, UpdatePatientInput } from '../validators/patient.validator.js';
import { Prisma } from '@prisma/client';

export class PatientService {
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    barangayId?: string;
  }) {
    const { page = 1, limit = 10, search, status, barangayId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { philhealth: { contains: search } },
      ];
    }

    if (status) {
      where.status = status as 'Active' | 'Inactive';
    }

    if (barangayId) {
      where.barangayId = barangayId;
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          barangay: true,
          _count: {
            select: {
              consultations: true,
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return { patients, total, page, limit };
  }

  async findById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        barangay: true,
        medicalHistory: true,
        appointments: {
          take: 5,
          orderBy: { scheduledDate: 'desc' },
          include: { staff: true },
        },
        consultations: {
          take: 5,
          orderBy: { date: 'desc' },
          include: { staff: true },
        },
        vitalSigns: {
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return patient;
  }

  async create(data: CreatePatientInput) {
    return prisma.patient.create({
      data: {
        ...data,
        dob: new Date(data.dob),
      },
      include: { barangay: true },
    });
  }

  async update(id: string, data: UpdatePatientInput) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(data.dob && { dob: new Date(data.dob) }),
      },
      include: { barangay: true },
    });
  }

  async delete(id: string) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    await prisma.patient.delete({ where: { id } });
  }
}

export const patientService = new PatientService();

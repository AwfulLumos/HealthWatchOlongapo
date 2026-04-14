import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { CreatePatientInput, UpdatePatientInput } from '../validators/patient.validator.js';
import { Prisma } from '@prisma/client';

export class PatientService {
  private normalizeBarangayName(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '');
  }

  private async resolveBarangayId(input: {
    barangayId?: string;
    barangay?: string;
  }): Promise<string | undefined> {
    if (input.barangayId) {
      return input.barangayId;
    }

    if (!input.barangay) {
      return undefined;
    }

    const name = input.barangay.trim().replace(/\s+/g, ' ');
    if (!name) {
      return undefined;
    }

    const exact = await prisma.barangay.findUnique({ where: { name } });
    if (exact) {
      return exact.id;
    }

    const normalized = this.normalizeBarangayName(name);
    const all = await prisma.barangay.findMany({ select: { id: true, name: true } });
    const matches = all.filter((b) => this.normalizeBarangayName(b.name) === normalized);

    if (matches.length === 1) {
      return matches[0].id;
    }

    if (!matches.length) {
      throw new ValidationError('Validation failed', {
        barangay: ['Barangay not found'],
      });
    }

    throw new ValidationError('Validation failed', {
      barangay: ['Barangay name is ambiguous. Please select a barangay from the list.'],
    });
  }

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
    const resolvedBarangayId = await this.resolveBarangayId({
      barangayId: data.barangayId,
      barangay: data.barangay,
    });

    const { dob, barangayId: _barangayId, barangay: _barangay, ...rest } = data;

    return prisma.patient.create({
      data: {
        ...rest,
        dob: new Date(dob),
        ...(resolvedBarangayId ? { barangayId: resolvedBarangayId } : {}),
      },
      include: { barangay: true },
    });
  }

  async update(id: string, data: UpdatePatientInput) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    const resolvedBarangayId = await this.resolveBarangayId({
      barangayId: data.barangayId,
      barangay: data.barangay,
    });

    const { dob, barangayId: _barangayId, barangay: _barangay, ...rest } = data;

    return prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        ...(dob && { dob: new Date(dob) }),
        ...(resolvedBarangayId ? { barangayId: resolvedBarangayId } : {}),
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

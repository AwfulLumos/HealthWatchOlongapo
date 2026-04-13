import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { CreateConsultationInput, UpdateConsultationInput } from '../validators/consultation.validator.js';
import { Prisma } from '@prisma/client';

interface ConsultationCreationOptions {
  patients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    status: string;
  }>;
  defaultStaffId?: string;
}

export class ConsultationService {
  async getCreationOptions(userId?: string): Promise<ConsultationCreationOptions> {
    const [patients, user] = await Promise.all([
      prisma.patient.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      userId
        ? prisma.user.findUnique({
            where: { id: userId },
            select: { staffId: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      patients: patients.map((patient) => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        fullName: `${patient.firstName} ${patient.lastName}`.trim(),
        status: patient.status,
      })),
      defaultStaffId: user?.staffId ?? undefined,
    };
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    patientId?: string;
    staffId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, patientId, staffId, status, type, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ConsultationWhereInput = {};

    if (patientId) where.patientId = patientId;
    if (staffId) where.staffId = staffId;
    if (status) where.status = status as any;
    if (type) where.type = type as any;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          staff: { select: { id: true, firstName: true, lastName: true, role: true } },
          _count: { select: { prescriptions: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.consultation.count({ where }),
    ]);

    return { consultations, total, page, limit };
  }

  async findById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
        prescriptions: true,
        vitalSigns: true,
      },
    });

    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return consultation;
  }

  async create(data: CreateConsultationInput, userId?: string) {
    let staffId = data.staffId;

    if (!staffId && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { staffId: true },
      });
      staffId = user?.staffId ?? undefined;
    }

    if (!staffId) {
      throw new ValidationError('Validation failed', {
        staffId: [
          'No staff profile found for this user. Please assign a staff account or provide a staffId.',
        ],
      });
    }

    return prisma.consultation.create({
      data: {
        ...data,
        staffId,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdateConsultationInput) {
    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return prisma.consultation.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    await prisma.consultation.delete({ where: { id } });
  }
}

export const consultationService = new ConsultationService();

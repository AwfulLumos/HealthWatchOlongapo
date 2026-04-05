import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { CreateConsultationInput, UpdateConsultationInput } from '../validators/consultation.validator.js';
import { Prisma } from '@prisma/client';

export class ConsultationService {
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

  async create(data: CreateConsultationInput) {
    return prisma.consultation.create({
      data: {
        ...data,
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

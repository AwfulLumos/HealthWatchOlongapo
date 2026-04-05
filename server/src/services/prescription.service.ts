import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { CreatePrescriptionInput, UpdatePrescriptionInput } from '../validators/prescription.validator.js';

export class PrescriptionService {
  async findAll(params: {
    page?: number;
    limit?: number;
    patientId?: string;
    consultId?: string;
    doctorId?: string;
  }) {
    const { page = 1, limit = 10, patientId, consultId, doctorId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (consultId) where.consultId = consultId;
    if (doctorId) where.doctorId = doctorId;

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          doctor: { select: { id: true, firstName: true, lastName: true } },
          consultation: { select: { id: true, diagnosis: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.prescription.count({ where }),
    ]);

    return { prescriptions, total, page, limit };
  }

  async findById(id: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        consultation: true,
      },
    });

    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    return prescription;
  }

  async create(data: CreatePrescriptionInput) {
    return prisma.prescription.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdatePrescriptionInput) {
    const prescription = await prisma.prescription.findUnique({ where: { id } });
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    return prisma.prescription.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    const prescription = await prisma.prescription.findUnique({ where: { id } });
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    await prisma.prescription.delete({ where: { id } });
  }
}

export const prescriptionService = new PrescriptionService();

import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { CreateVitalSignsInput, UpdateVitalSignsInput } from '../validators/vitalSigns.validator.js';

function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

export class VitalSignsService {
  async findAll(params: {
    page?: number;
    limit?: number;
    patientId?: string;
    consultId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, patientId, consultId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (consultId) where.consultId = consultId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [vitalSigns, total] = await Promise.all([
      prisma.vitalSigns.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.vitalSigns.count({ where }),
    ]);

    return { vitalSigns, total, page, limit };
  }

  async findById(id: string) {
    const vitalSigns = await prisma.vitalSigns.findUnique({
      where: { id },
      include: {
        patient: true,
        consultation: true,
      },
    });

    if (!vitalSigns) {
      throw new NotFoundError('Vital signs record not found');
    }

    return vitalSigns;
  }

  async create(data: CreateVitalSignsInput) {
    const bmi = calculateBMI(data.weight, data.height);

    return prisma.vitalSigns.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        bmi,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdateVitalSignsInput) {
    const vitalSigns = await prisma.vitalSigns.findUnique({ where: { id } });
    if (!vitalSigns) {
      throw new NotFoundError('Vital signs record not found');
    }

    let bmi = Number(vitalSigns.bmi);
    const weight = data.weight ?? Number(vitalSigns.weight);
    const height = data.height ?? Number(vitalSigns.height);
    
    if (data.weight || data.height) {
      bmi = calculateBMI(weight, height);
    }

    return prisma.vitalSigns.update({
      where: { id },
      data: { ...data, bmi },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    const vitalSigns = await prisma.vitalSigns.findUnique({ where: { id } });
    if (!vitalSigns) {
      throw new NotFoundError('Vital signs record not found');
    }

    await prisma.vitalSigns.delete({ where: { id } });
  }

  async getLatestByPatient(patientId: string) {
    return prisma.vitalSigns.findFirst({
      where: { patientId },
      orderBy: { date: 'desc' },
    });
  }
}

export const vitalSignsService = new VitalSignsService();

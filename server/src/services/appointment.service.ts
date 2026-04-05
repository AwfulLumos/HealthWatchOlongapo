import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../validators/appointment.validator.js';
import { Prisma } from '@prisma/client';

export class AppointmentService {
  async findAll(params: {
    page?: number;
    limit?: number;
    patientId?: string;
    staffId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, patientId, staffId, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {};

    if (patientId) where.patientId = patientId;
    if (staffId) where.staffId = staffId;
    if (status) where.status = status as any;

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate);
      if (endDate) where.scheduledDate.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          staff: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total, page, limit };
  }

  async findById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    return appointment;
  }

  async create(data: CreateAppointmentInput) {
    return prisma.appointment.create({
      data: {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdateAppointmentInput) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    await prisma.appointment.delete({ where: { id } });
  }
}

export const appointmentService = new AppointmentService();

import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import {
  AppointmentListQueryInput,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../validators/appointment.validator.js';
import { Prisma } from '@prisma/client';
import { endOfDay, startOfDay } from '../utils/date.js';

interface AppointmentCreationOptions {
  patients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    status: string;
  }>;
  staff: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    accountStatus: string;
  }>;
  defaultStaffId?: string;
}

export class AppointmentService {
  private isDateOnlyString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private parseScheduledDate(input: string, isEndRange = false): Date {
    if (this.isDateOnlyString(input)) {
      const [year, month, day] = input.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return isEndRange ? endOfDay(date) : startOfDay(date);
    }

    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationError('Validation failed', {
        scheduledDate: ['Invalid date format'],
      });
    }
    return parsed;
  }

  private ensureSchedulableDate(date: Date, status?: string): void {
    if (status === 'Completed' || status === 'Cancelled') {
      return;
    }

    if (date.getTime() < Date.now()) {
      throw new ValidationError('Validation failed', {
        scheduledDate: ['Appointment date/time cannot be in the past'],
      });
    }
  }

  private async ensureValidParticipants(patientId: string, staffId: string): Promise<void> {
    const [patient, staff] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, status: true },
      }),
      prisma.staff.findUnique({
        where: { id: staffId },
        select: { id: true, accountStatus: true },
      }),
    ]);

    const errors: Record<string, string[]> = {};

    if (!patient) {
      errors.patientId = ['Patient not found'];
    } else if (patient.status !== 'Active') {
      errors.patientId = ['Cannot schedule appointment for inactive patient'];
    }

    if (!staff) {
      errors.staffId = ['Staff not found'];
    } else if (staff.accountStatus !== 'Active') {
      errors.staffId = ['Cannot assign appointment to inactive staff'];
    }

    if (Object.keys(errors).length) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private async ensureNoScheduleConflict(input: {
    scheduledDate: Date;
    patientId: string;
    staffId: string;
    status?: string;
    excludeAppointmentId?: string;
  }): Promise<void> {
    const { scheduledDate, patientId, staffId, status, excludeAppointmentId } = input;

    if (status === 'Cancelled') {
      return;
    }

    const where: Prisma.AppointmentWhereInput = {
      scheduledDate,
      status: { not: 'Cancelled' },
      OR: [{ patientId }, { staffId }],
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const conflict = await prisma.appointment.findFirst({ where });
    if (!conflict) {
      return;
    }

    const messages: string[] = [];
    if (conflict.patientId === patientId) {
      messages.push('Patient already has an appointment at this date/time');
    }
    if (conflict.staffId === staffId) {
      messages.push('Staff already has an appointment at this date/time');
    }

    throw new ValidationError('Validation failed', {
      scheduledDate: messages.length ? messages : ['Schedule conflict detected'],
    });
  }

  async getCreationOptions(userId?: string): Promise<AppointmentCreationOptions> {
    const [patients, staffMembers, user] = await Promise.all([
      prisma.patient.findMany({
        where: { status: 'Active' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.staff.findMany({
        where: {
          accountStatus: 'Active',
          role: { in: ['Doctor', 'Nurse', 'Midwife'] },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          accountStatus: true,
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
      staff: staffMembers.map((staff) => ({
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        fullName: `${staff.firstName} ${staff.lastName}`.trim(),
        role: staff.role,
        accountStatus: staff.accountStatus,
      })),
      defaultStaffId: user?.staffId ?? undefined,
    };
  }

  async findAll(params: AppointmentListQueryInput) {
    const { page = 1, limit = 10, patientId, staffId, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {};

    if (patientId) where.patientId = patientId;
    if (staffId) where.staffId = staffId;
    if (status?.length) {
      where.status = status.length === 1 ? status[0] : { in: status };
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = this.parseScheduledDate(startDate, false);
      if (endDate) where.scheduledDate.lte = this.parseScheduledDate(endDate, true);
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
    const scheduledDate = this.parseScheduledDate(data.scheduledDate);
    this.ensureSchedulableDate(scheduledDate, data.status);
    await this.ensureValidParticipants(data.patientId, data.staffId);
    await this.ensureNoScheduleConflict({
      scheduledDate,
      patientId: data.patientId,
      staffId: data.staffId,
      status: data.status,
    });

    return prisma.appointment.create({
      data: {
        ...data,
        scheduledDate,
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

    const nextPatientId = data.patientId ?? appointment.patientId;
    const nextStaffId = data.staffId ?? appointment.staffId;
    const nextStatus = data.status ?? appointment.status;
    const nextScheduledDate = data.scheduledDate
      ? this.parseScheduledDate(data.scheduledDate)
      : appointment.scheduledDate;

    if (data.patientId || data.staffId) {
      await this.ensureValidParticipants(nextPatientId, nextStaffId);
    }

    if (data.scheduledDate || data.status) {
      this.ensureSchedulableDate(nextScheduledDate, nextStatus);
    }

    if (data.scheduledDate || data.patientId || data.staffId || data.status) {
      await this.ensureNoScheduleConflict({
        scheduledDate: nextScheduledDate,
        patientId: nextPatientId,
        staffId: nextStaffId,
        status: nextStatus,
        excludeAppointmentId: id,
      });
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(data.scheduledDate && { scheduledDate: nextScheduledDate }),
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

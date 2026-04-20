import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { CreateStaffInput, UpdateStaffInput } from '../validators/staff.validator.js';
import { Prisma } from '@prisma/client';

export class StaffService {
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    stationId?: string;
  }) {
    const { page = 1, limit = 10, search, role, status, stationId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StaffWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role as any;
    }

    if (status) {
      where.accountStatus = status as 'Active' | 'Inactive';
    }

    if (stationId) {
      where.stationId = stationId;
    }

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: {
          station: true,
          user: { select: { id: true, username: true, lastLogin: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);

    return { staff, total, page, limit };
  }

  async findById(id: string) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        station: true,
        user: { select: { id: true, username: true, email: true, lastLogin: true } },
      },
    });

    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    return staff;
  }

  async create(data: CreateStaffInput) {
    return prisma.staff.create({
      data,
      include: { station: true },
    });
  }

  async update(id: string, data: UpdateStaffInput) {
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    return prisma.staff.update({
      where: { id },
      data,
      include: { station: true },
    });
  }

  async delete(id: string) {
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    await prisma.staff.delete({ where: { id } });
  }
}

export const staffService = new StaffService();

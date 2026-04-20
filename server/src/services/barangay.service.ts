import { prisma } from '../config/database.js';

export class BarangayService {
  async findAll() {
    return prisma.barangay.findMany({
      select: {
        id: true,
        name: true,
        zipCode: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const barangayService = new BarangayService();

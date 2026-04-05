import { prisma } from '../config/database.js';
import { startOfDay, endOfDay, addDays } from '../utils/date.js';

export class DashboardService {
  async getStats() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients,
      activePatients,
      todayAppointments,
      pendingAppointments,
      monthlyConsultations,
      totalStaff,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { status: 'Active' } }),
      prisma.appointment.count({
        where: {
          scheduledDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.appointment.count({
        where: { status: 'Pending' },
      }),
      prisma.consultation.count({
        where: {
          date: { gte: startOfMonth },
        },
      }),
      prisma.staff.count({ where: { accountStatus: 'Active' } }),
    ]);

    return {
      totalPatients,
      activePatients,
      todayAppointments,
      pendingAppointments,
      monthlyConsultations,
      totalStaff,
    };
  }

  async getUpcomingAppointments(limit = 5) {
    const now = new Date();

    return prisma.appointment.findMany({
      where: {
        scheduledDate: { gte: now },
        status: { in: ['Pending', 'Confirmed'] },
      },
      take: limit,
      orderBy: { scheduledDate: 'asc' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getRecentPatients(limit = 5) {
    return prisma.patient.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        barangay: { select: { name: true } },
      },
    });
  }

  async getConsultationsByMonth(months = 6) {
    const results: { month: string; count: number }[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const count = await prisma.consultation.count({
        where: {
          date: { gte: start, lte: end },
        },
      });

      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return results;
  }

  async getTopDiagnoses(limit = 5) {
    const diagnoses = await prisma.consultation.groupBy({
      by: ['diagnosis'],
      _count: { diagnosis: true },
      orderBy: { _count: { diagnosis: 'desc' } },
      take: limit,
    });

    return diagnoses.map((d) => ({
      diagnosis: d.diagnosis,
      count: d._count.diagnosis,
    }));
  }
}

export const dashboardService = new DashboardService();

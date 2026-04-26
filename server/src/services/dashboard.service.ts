import { prisma } from '../config/database.js';
import { startOfDay, endOfDay, addDays } from '../utils/date.js';

interface DiseaseTrendPoint {
  month: string;
  count: number;
}

interface DiseaseTrendSummary {
  diagnosis: string;
  totalCases: number;
  latestMonthCases: number;
  previousMonthCases: number;
  growthRate: number;
  trend: DiseaseTrendPoint[];
}

interface OutbreakAlert {
  diagnosis: string;
  latestMonthCases: number;
  previousMonthCases: number;
  growthRate: number;
  mostAffectedBarangays: Array<{ barangay: string; count: number }>;
}

interface DiseaseTrendAnalysis {
  months: string[];
  trends: DiseaseTrendSummary[];
  trendChart: Array<Record<string, number | string>>;
  potentialOutbreaks: OutbreakAlert[];
}

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
    const results: Array<{
      month: string;
      regular: number;
      followUp: number;
      emergency: number;
      total: number;
      count: number;
    }> = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

      const [regular, followUp, emergency] = await Promise.all([
        prisma.consultation.count({
          where: {
            date: { gte: start, lt: end },
            type: 'Regular',
          },
        }),
        prisma.consultation.count({
          where: {
            date: { gte: start, lt: end },
            type: 'FollowUp',
          },
        }),
        prisma.consultation.count({
          where: {
            date: { gte: start, lt: end },
            type: 'Emergency',
          },
        }),
      ]);
      const total = regular + followUp + emergency;

      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        regular,
        followUp,
        emergency,
        total,
        count: total,
      });
    }

    return results;
  }

  async getPatientDemographics() {
    const counts = await prisma.patient.groupBy({
      by: ['gender'],
      _count: { gender: true },
    });

    const countByGender = new Map(counts.map((item) => [item.gender, item._count.gender]));
    const maleCount = countByGender.get('Male') ?? 0;
    const femaleCount = countByGender.get('Female') ?? 0;
    const total = maleCount + femaleCount;

    const toPercent = (value: number): number => (total === 0 ? 0 : Math.round((value / total) * 100));

    return [
      { name: 'Male', value: toPercent(maleCount), count: maleCount, color: '#3B82F6' },
      { name: 'Female', value: toPercent(femaleCount), count: femaleCount, color: '#EC4899' },
    ];
  }

  async getPatientsByMonth(months = 6) {
    const results: { month: string; count: number }[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const count = await prisma.patient.count({
        where: {
          createdAt: { gte: start, lte: end },
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

  async getDiseaseTrendAnalysis(months = 6, topDiseases = 5, growthAlertThreshold = 0.3): Promise<DiseaseTrendAnalysis> {
    const safeMonths = Math.max(2, Math.min(months, 12));
    const safeTopDiseases = Math.max(1, Math.min(topDiseases, 10));
    const today = new Date();
    const monthStarts: Date[] = [];
    const monthKeys: string[] = [];
    const monthLabels = new Map<string, string>();

    for (let i = safeMonths - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
      monthStarts.push(start);
      monthKeys.push(key);
      monthLabels.set(key, start.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }

    const rangeStart = monthStarts[0];
    const rangeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const latestMonthKey = monthKeys[monthKeys.length - 1];
    const previousMonthKey = monthKeys[monthKeys.length - 2];

    const consultations = await prisma.consultation.findMany({
      where: {
        date: { gte: rangeStart, lt: rangeEnd },
      },
      select: {
        date: true,
        diagnosis: true,
        patient: {
          select: {
            barangay: {
              select: { name: true },
            },
          },
        },
      },
    });

    const diagnosisTotals = new Map<string, number>();
    const diagnosisLabels = new Map<string, string>();
    const diagnosisByMonth = new Map<string, Map<string, number>>();
    const latestMonthBarangays = new Map<string, Map<string, number>>();

    for (const consultation of consultations) {
      const diagnosisLabel = consultation.diagnosis.trim();
      if (!diagnosisLabel) continue;

      const diagnosisKey = diagnosisLabel.toLowerCase();
      const monthStart = new Date(consultation.date.getFullYear(), consultation.date.getMonth(), 1);
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      if (!monthLabels.has(monthKey)) continue;

      diagnosisLabels.set(diagnosisKey, diagnosisLabel);
      diagnosisTotals.set(diagnosisKey, (diagnosisTotals.get(diagnosisKey) ?? 0) + 1);

      const monthlyCounts = diagnosisByMonth.get(diagnosisKey) ?? new Map<string, number>();
      monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) ?? 0) + 1);
      diagnosisByMonth.set(diagnosisKey, monthlyCounts);

      if (monthKey === latestMonthKey) {
        const barangayName = consultation.patient.barangay?.name ?? 'Unspecified';
        const barangayCounts = latestMonthBarangays.get(diagnosisKey) ?? new Map<string, number>();
        barangayCounts.set(barangayName, (barangayCounts.get(barangayName) ?? 0) + 1);
        latestMonthBarangays.set(diagnosisKey, barangayCounts);
      }
    }

    const topDiagnosisKeys = [...diagnosisTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, safeTopDiseases)
      .map(([diagnosisKey]) => diagnosisKey);

    const trends: DiseaseTrendSummary[] = topDiagnosisKeys.map((diagnosisKey) => {
      const monthlyCounts = diagnosisByMonth.get(diagnosisKey) ?? new Map<string, number>();
      const trend = monthKeys.map((monthKey) => ({
        month: monthLabels.get(monthKey) ?? monthKey,
        count: monthlyCounts.get(monthKey) ?? 0,
      }));
      const latestMonthCases = monthlyCounts.get(latestMonthKey) ?? 0;
      const previousMonthCases = monthlyCounts.get(previousMonthKey) ?? 0;
      const growthRate =
        previousMonthCases === 0
          ? latestMonthCases > 0 ? 1 : 0
          : (latestMonthCases - previousMonthCases) / previousMonthCases;

      return {
        diagnosis: diagnosisLabels.get(diagnosisKey) ?? diagnosisKey,
        totalCases: diagnosisTotals.get(diagnosisKey) ?? 0,
        latestMonthCases,
        previousMonthCases,
        growthRate,
        trend,
      };
    });

    const potentialOutbreaks: OutbreakAlert[] = trends
      .filter((trend) => trend.latestMonthCases >= 3 && trend.growthRate >= growthAlertThreshold)
      .map((trend) => {
        const diagnosisKey = trend.diagnosis.toLowerCase();
        const barangays = [...(latestMonthBarangays.get(diagnosisKey)?.entries() ?? [])]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([barangay, count]) => ({ barangay, count }));

        return {
          diagnosis: trend.diagnosis,
          latestMonthCases: trend.latestMonthCases,
          previousMonthCases: trend.previousMonthCases,
          growthRate: trend.growthRate,
          mostAffectedBarangays: barangays,
        };
      });

    const trendChart = monthKeys.map((monthKey) => {
      const point: Record<string, number | string> = { month: monthLabels.get(monthKey) ?? monthKey };
      for (const trend of trends) {
        const monthPoint = trend.trend.find((item) => item.month === point.month);
        point[trend.diagnosis] = monthPoint?.count ?? 0;
      }
      return point;
    });

    return {
      months: monthKeys.map((monthKey) => monthLabels.get(monthKey) ?? monthKey),
      trends,
      trendChart,
      potentialOutbreaks,
    };
  }
}

export const dashboardService = new DashboardService();

import { useState, useCallback, useEffect } from 'react';
import type { DashboardData } from '../models';
import { dashboardService } from '../services';

const initialDashboardData: DashboardData = {
  stats: [],
  consultationChart: [],
  monthlyPatients: [],
  diagnosisBreakdown: [],
  recentActivity: [],
  upcomingAppointments: [],
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardData = await dashboardService.getDashboardData();
      setData(dashboardData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...data,
    loading,
    refresh,
  };
}

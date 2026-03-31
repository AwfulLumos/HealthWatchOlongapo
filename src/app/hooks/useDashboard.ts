import { useState, useCallback } from 'react';
import type { DashboardData } from '../models';
import { dashboardService } from '../services';

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(() => dashboardService.getDashboardData());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setData(dashboardService.getDashboardData());
    setLoading(false);
  }, []);

  return {
    ...data,
    loading,
    refresh,
  };
}

import { useState, useCallback, useEffect } from 'react';
import type { VitalSigns, VitalSignsFormData } from '../models';
import { vitalSignsService } from '../services';

export function useVitalSigns() {
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vitalSignsService.getAll();
      setVitals(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback(async (id: string) => {
    return await vitalSignsService.getById(id);
  }, []);

  const getByConsultationId = useCallback(async (consultId: string) => {
    return await vitalSignsService.getByConsultationId(consultId);
  }, []);

  const getByPatient = useCallback(async (patientName: string) => {
    return await vitalSignsService.getByPatient(patientName);
  }, []);

  const getLatestByPatient = useCallback(async (patientName: string) => {
    return await vitalSignsService.getLatestByPatient(patientName);
  }, []);

  const getBPTrend = useCallback(async (patientName: string) => {
    return await vitalSignsService.getBPTrend(patientName);
  }, []);

  const create = useCallback(async (data: VitalSignsFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newVital = await vitalSignsService.create(data);
      await refresh();
      return newVital;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record vital signs');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<VitalSignsFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await vitalSignsService.update(id, data);
      if (updated) await refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update vital signs');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await vitalSignsService.delete(id);
      if (success) await refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete vital signs');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    vitals,
    loading,
    error,
    refresh,
    getById,
    getByConsultationId,
    getByPatient,
    getLatestByPatient,
    getBPTrend,
    create,
    update,
    remove,
  };
}

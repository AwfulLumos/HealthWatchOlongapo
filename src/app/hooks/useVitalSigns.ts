import { useState, useCallback } from 'react';
import type { VitalSigns, VitalSignsFormData } from '../models';
import { vitalSignsService } from '../services';

export function useVitalSigns() {
  const [vitals, setVitals] = useState<VitalSigns[]>(() => vitalSignsService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setVitals(vitalSignsService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return vitalSignsService.getById(id);
  }, []);

  const getByConsultationId = useCallback((consultId: string) => {
    return vitalSignsService.getByConsultationId(consultId);
  }, []);

  const getByPatient = useCallback((patientName: string) => {
    return vitalSignsService.getByPatient(patientName);
  }, []);

  const getLatestByPatient = useCallback((patientName: string) => {
    return vitalSignsService.getLatestByPatient(patientName);
  }, []);

  const getBPTrend = useCallback((patientName: string) => {
    return vitalSignsService.getBPTrend(patientName);
  }, []);

  const create = useCallback((data: VitalSignsFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newVital = vitalSignsService.create(data);
      refresh();
      return newVital;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record vital signs');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<VitalSignsFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = vitalSignsService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update vital signs');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = vitalSignsService.delete(id);
      if (success) refresh();
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

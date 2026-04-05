import { useState, useCallback, useEffect } from 'react';
import type { Consultation, ConsultationFormData } from '../models';
import { consultationService } from '../services';

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [diagnosisStats, setDiagnosisStats] = useState<{ name: string; count: number }[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await consultationService.getAll();
      setConsultations(data);
      const count = await consultationService.getTodayCount();
      setTodayCount(count);
      const stats = await consultationService.getDiagnosisStats();
      setDiagnosisStats(stats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback(async (id: string) => {
    return await consultationService.getById(id);
  }, []);

  const getByPatientId = useCallback(async (patientId: string) => {
    return await consultationService.getByPatientId(patientId);
  }, []);

  const getByDate = useCallback(async (date: string) => {
    return await consultationService.getByDate(date);
  }, []);

  const getByType = useCallback(async (type: Consultation['type']) => {
    return await consultationService.getByType(type);
  }, []);

  const create = useCallback(async (data: ConsultationFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newConsultation = await consultationService.create(data);
      await refresh();
      return newConsultation;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create consultation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Consultation>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await consultationService.update(id, data);
      if (updated) await refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update consultation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await consultationService.delete(id);
      if (success) await refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete consultation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const complete = useCallback(async (id: string) => {
    const result = await consultationService.complete(id);
    if (result) await refresh();
    return result;
  }, [refresh]);

  return {
    consultations,
    loading,
    error,
    refresh,
    getById,
    getByPatientId,
    getByDate,
    getByType,
    create,
    update,
    remove,
    complete,
    todayCount,
    diagnosisStats,
  };
}

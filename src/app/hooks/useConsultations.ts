import { useState, useCallback } from 'react';
import type { Consultation, ConsultationFormData } from '../models';
import { consultationService } from '../services';

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>(() => consultationService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setConsultations(consultationService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return consultationService.getById(id);
  }, []);

  const getByPatientId = useCallback((patientId: string) => {
    return consultationService.getByPatientId(patientId);
  }, []);

  const getByDate = useCallback((date: string) => {
    return consultationService.getByDate(date);
  }, []);

  const getByType = useCallback((type: Consultation['type']) => {
    return consultationService.getByType(type);
  }, []);

  const create = useCallback((data: ConsultationFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newConsultation = consultationService.create(data);
      refresh();
      return newConsultation;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create consultation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Consultation>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = consultationService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update consultation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = consultationService.delete(id);
      if (success) refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete consultation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const complete = useCallback((id: string) => {
    const result = consultationService.complete(id);
    if (result) refresh();
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
    todayCount: consultationService.getTodayCount(),
    diagnosisStats: consultationService.getDiagnosisStats(),
  };
}

import { useState, useCallback, useEffect } from 'react';
import type { Prescription, PrescriptionFormData } from '../models';
import { prescriptionService } from '../services';

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicineStats, setMedicineStats] = useState<{ medicine: string; count: number }[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await prescriptionService.getAll();
      setPrescriptions(data);
      const stats = await prescriptionService.getMedicineStats();
      setMedicineStats(stats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback(async (id: string) => {
    return await prescriptionService.getById(id);
  }, []);

  const getByConsultationId = useCallback(async (consultId: string) => {
    return await prescriptionService.getByConsultationId(consultId);
  }, []);

  const getByPatient = useCallback(async (patientName: string) => {
    return await prescriptionService.getByPatient(patientName);
  }, []);

  const create = useCallback(async (data: PrescriptionFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newPrescription = await prescriptionService.create(data);
      await refresh();
      return newPrescription;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Prescription>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await prescriptionService.update(id, data);
      if (updated) await refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await prescriptionService.delete(id);
      if (success) await refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete prescription');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    prescriptions,
    loading,
    error,
    refresh,
    getById,
    getByConsultationId,
    getByPatient,
    create,
    update,
    remove,
    medicineStats,
  };
}

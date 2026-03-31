import { useState, useCallback } from 'react';
import type { Prescription, PrescriptionFormData } from '../models';
import { prescriptionService } from '../services';

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => prescriptionService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setPrescriptions(prescriptionService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return prescriptionService.getById(id);
  }, []);

  const getByConsultationId = useCallback((consultId: string) => {
    return prescriptionService.getByConsultationId(consultId);
  }, []);

  const getByPatient = useCallback((patientName: string) => {
    return prescriptionService.getByPatient(patientName);
  }, []);

  const create = useCallback((data: PrescriptionFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newPrescription = prescriptionService.create(data);
      refresh();
      return newPrescription;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Prescription>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = prescriptionService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = prescriptionService.delete(id);
      if (success) refresh();
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
    medicineStats: prescriptionService.getMedicineStats(),
  };
}

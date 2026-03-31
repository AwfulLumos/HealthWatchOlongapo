import { useState, useCallback } from 'react';
import type { Patient, PatientFormData } from '../models';
import { patientService } from '../services';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(() => patientService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setPatients(patientService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return patientService.getById(id);
  }, []);

  const search = useCallback((query: string) => {
    return patientService.search(query);
  }, []);

  const getByBarangay = useCallback((barangay: string) => {
    return patientService.getByBarangay(barangay);
  }, []);

  const create = useCallback((data: PatientFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newPatient = patientService.create(data);
      refresh();
      return newPatient;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create patient');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Patient>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = patientService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update patient');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = patientService.delete(id);
      if (success) refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete patient');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    patients,
    loading,
    error,
    refresh,
    getById,
    search,
    getByBarangay,
    create,
    update,
    remove,
    count: patients.length,
    activeCount: patientService.getActiveCount(),
  };
}

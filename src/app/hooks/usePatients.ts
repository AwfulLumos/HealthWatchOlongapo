import { useState, useCallback, useEffect } from 'react';
import type { Patient, PatientFormData } from '../models';
import { patientService } from '../services';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getAll();
      setPatients(data);
      const count = await patientService.getActiveCount();
      setActiveCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback(async (id: string) => {
    return await patientService.getById(id);
  }, []);

  const search = useCallback(async (query: string) => {
    return await patientService.search(query);
  }, []);

  const getByBarangay = useCallback(async (barangay: string) => {
    return await patientService.getByBarangay(barangay);
  }, []);

  const create = useCallback(async (data: PatientFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newPatient = await patientService.create(data);
      await refresh();
      return newPatient;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create patient');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Patient>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await patientService.update(id, data);
      if (updated) await refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update patient');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await patientService.delete(id);
      if (success) await refresh();
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
    activeCount,
  };
}

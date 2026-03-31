import { useState, useCallback } from 'react';
import type { BarangayStation, BarangayStationFormData } from '../models';
import { barangayStationService } from '../services';

export function useBarangayStations() {
  const [stations, setStations] = useState<BarangayStation[]>(() => barangayStationService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStations(barangayStationService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return barangayStationService.getById(id);
  }, []);

  const getByBarangay = useCallback((barangay: string) => {
    return barangayStationService.getByBarangay(barangay);
  }, []);

  const search = useCallback((query: string) => {
    return barangayStationService.search(query);
  }, []);

  const create = useCallback((data: BarangayStationFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newStation = barangayStationService.create(data);
      refresh();
      return newStation;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add station');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<BarangayStation>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = barangayStationService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update station');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = barangayStationService.delete(id);
      if (success) refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove station');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    stations,
    loading,
    error,
    refresh,
    getById,
    getByBarangay,
    search,
    create,
    update,
    remove,
  };
}

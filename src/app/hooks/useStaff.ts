import { useState, useCallback } from 'react';
import type { Staff, StaffFormData } from '../models';
import { staffService } from '../services';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>(() => staffService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStaff(staffService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return staffService.getById(id);
  }, []);

  const getByRole = useCallback((role: Staff['role']) => {
    return staffService.getByRole(role);
  }, []);

  const getByStation = useCallback((station: string) => {
    return staffService.getByStation(station);
  }, []);

  const getActive = useCallback(() => {
    return staffService.getActive();
  }, []);

  const search = useCallback((query: string) => {
    return staffService.search(query);
  }, []);

  const create = useCallback((data: StaffFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newStaff = staffService.create(data);
      refresh();
      return newStaff;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add staff');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Staff>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = staffService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update staff');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = staffService.delete(id);
      if (success) refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove staff');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const activate = useCallback((id: string) => {
    const result = staffService.activate(id);
    if (result) refresh();
    return result;
  }, [refresh]);

  const deactivate = useCallback((id: string) => {
    const result = staffService.deactivate(id);
    if (result) refresh();
    return result;
  }, [refresh]);

  return {
    staff,
    loading,
    error,
    refresh,
    getById,
    getByRole,
    getByStation,
    getActive,
    search,
    create,
    update,
    remove,
    activate,
    deactivate,
    activeCount: staffService.getActiveCount(),
  };
}

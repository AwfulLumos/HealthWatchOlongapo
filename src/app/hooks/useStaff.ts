import { useState, useCallback, useEffect } from 'react';
import type { Staff, StaffFormData } from '../models';
import { staffService } from '../services';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await staffService.getAll();
      setStaff(data);
      const count = await staffService.getActiveCount();
      setActiveCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback(async (id: string) => {
    return await staffService.getById(id);
  }, []);

  const getByRole = useCallback(async (role: Staff['role']) => {
    return await staffService.getByRole(role);
  }, []);

  const getByStation = useCallback(async (station: string) => {
    return await staffService.getByStation(station);
  }, []);

  const getActive = useCallback(async () => {
    return await staffService.getActive();
  }, []);

  const search = useCallback(async (query: string) => {
    return await staffService.search(query);
  }, []);

  const create = useCallback(async (data: StaffFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newStaff = await staffService.create(data);
      await refresh();
      return newStaff;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add staff');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Staff>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await staffService.update(id, data);
      if (updated) await refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update staff');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await staffService.delete(id);
      if (success) await refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove staff');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const activate = useCallback(async (id: string) => {
    const result = await staffService.activate(id);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const deactivate = useCallback(async (id: string) => {
    const result = await staffService.deactivate(id);
    if (result) await refresh();
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
    activeCount,
  };
}

import { useState, useCallback, useEffect } from 'react';
import type { Appointment, AppointmentFormData } from '../models';
import { appointmentService } from '../services';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
      const count = await appointmentService.getTodayCount();
      setTodayCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback(async (id: string) => {
    return await appointmentService.getById(id);
  }, []);

  const getByPatientId = useCallback(async (patientId: string) => {
    return await appointmentService.getByPatientId(patientId);
  }, []);

  const getByDate = useCallback(async (date: string) => {
    return await appointmentService.getByDate(date);
  }, []);

  const getUpcoming = useCallback(async () => {
    return await appointmentService.getUpcoming();
  }, []);

  const create = useCallback(async (data: AppointmentFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newAppointment = await appointmentService.create(data);
      await refresh();
      return newAppointment;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create appointment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Appointment>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await appointmentService.update(id, data);
      if (updated) await refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update appointment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await appointmentService.delete(id);
      if (success) await refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete appointment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const cancel = useCallback(async (id: string) => {
    const result = await appointmentService.cancel(id);
    if (result) await refresh();
    return result;
  }, [refresh]);

  const complete = useCallback(async (id: string) => {
    const result = await appointmentService.complete(id);
    if (result) await refresh();
    return result;
  }, [refresh]);

  return {
    appointments,
    loading,
    error,
    refresh,
    getById,
    getByPatientId,
    getByDate,
    getUpcoming,
    create,
    update,
    remove,
    cancel,
    complete,
    todayCount,
  };
}

import { useState, useCallback } from 'react';
import type { Appointment, AppointmentFormData } from '../models';
import { appointmentService } from '../services';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => appointmentService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setAppointments(appointmentService.getAll());
  }, []);

  const getById = useCallback((id: string) => {
    return appointmentService.getById(id);
  }, []);

  const getByPatientId = useCallback((patientId: string) => {
    return appointmentService.getByPatientId(patientId);
  }, []);

  const getByDate = useCallback((date: string) => {
    return appointmentService.getByDate(date);
  }, []);

  const getUpcoming = useCallback(() => {
    return appointmentService.getUpcoming();
  }, []);

  const create = useCallback((data: AppointmentFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newAppointment = appointmentService.create(data);
      refresh();
      return newAppointment;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create appointment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Appointment>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = appointmentService.update(id, data);
      if (updated) refresh();
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update appointment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = appointmentService.delete(id);
      if (success) refresh();
      return success;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete appointment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const cancel = useCallback((id: string) => {
    const result = appointmentService.cancel(id);
    if (result) refresh();
    return result;
  }, [refresh]);

  const complete = useCallback((id: string) => {
    const result = appointmentService.complete(id);
    if (result) refresh();
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
    todayCount: appointmentService.getTodayCount(),
  };
}

export const mockVitals = [
  { id: "V-0001", consultId: "C-0001", patient: "Maria Santos", date: "2026-03-28", bpSystolic: 145, bpDiastolic: 92, pulseRate: 84, respRate: 18, temp: 36.7, bloodSugar: 118, weight: 65, height: 162, bmi: 24.8 },
  { id: "V-0002", consultId: "C-0002", patient: "Juan Dela Cruz", date: "2026-03-28", bpSystolic: 130, bpDiastolic: 85, pulseRate: 78, respRate: 17, temp: 36.5, bloodSugar: 210, weight: 78, height: 170, bmi: 27.0 },
  { id: "V-0003", consultId: "C-0003", patient: "Ana Reyes", date: "2026-03-27", bpSystolic: 118, bpDiastolic: 76, pulseRate: 92, respRate: 20, temp: 38.2, bloodSugar: 95, weight: 52, height: 158, bmi: 20.8 },
  { id: "V-0004", consultId: "C-0004", patient: "Pedro Lim", date: "2026-03-27", bpSystolic: 160, bpDiastolic: 100, pulseRate: 95, respRate: 22, temp: 37.1, bloodSugar: 135, weight: 82, height: 168, bmi: 29.0 },
  { id: "V-0005", consultId: "C-0005", patient: "Rosa Garcia", date: "2026-03-26", bpSystolic: 128, bpDiastolic: 80, pulseRate: 76, respRate: 16, temp: 37.5, bloodSugar: 165, weight: 68, height: 155, bmi: 28.3 },
];

export type VitalRecord = (typeof mockVitals)[0];

export const bpTrendData = [
  { date: "Jan", systolic: 152, diastolic: 96 },
  { date: "Feb", systolic: 148, diastolic: 94 },
  { date: "Mar 1", systolic: 145, diastolic: 92 },
  { date: "Mar 7", systolic: 142, diastolic: 90 },
  { date: "Mar 14", systolic: 140, diastolic: 88 },
  { date: "Mar 21", systolic: 145, diastolic: 92 },
  { date: "Mar 28", systolic: 145, diastolic: 92 },
];

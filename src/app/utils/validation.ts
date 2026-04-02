/**
 * Form Validation Schemas
 * Centralized validation logic for all forms in the application
 */

import {
  sanitizeInput,
  isValidPhoneNumber,
  isValidEmail,
  isValidPhilHealth,
  isValidName,
  isValidDateOfBirth,
  isValidBloodType,
  validatePasswordStrength
} from './security';

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}

// ============================================
// GENERIC VALIDATION HELPERS
// ============================================

function required(value: unknown, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}

function minLength(value: string, min: number, fieldName: string): ValidationError | null {
  if (value.length < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min} characters` };
  }
  return null;
}

function maxLength(value: string, max: number, fieldName: string): ValidationError | null {
  if (value.length > max) {
    return { field: fieldName, message: `${fieldName} must be at most ${max} characters` };
  }
  return null;
}

// ============================================
// PATIENT FORM VALIDATION
// ============================================

export interface PatientFormInput {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType: string;
  civilStatus?: string;
  barangay: string;
  contact: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  philhealth: string;
  status?: string;
}

export function validatePatientForm(data: PatientFormInput): ValidationResult<PatientFormInput> {
  const errors: ValidationError[] = [];
  
  // Required fields
  const requiredFields: (keyof PatientFormInput)[] = [
    'firstName', 'lastName', 'dob', 'gender', 'bloodType', 
    'barangay', 'contact', 'address', 'emergencyContact', 
    'emergencyContactNumber', 'philhealth'
  ];
  
  requiredFields.forEach(field => {
    const error = required(data[field], field);
    if (error) errors.push({ ...error, field });
  });
  
  // If required fields are missing, return early
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  // Sanitize and validate first name
  const firstName = sanitizeInput(data.firstName);
  if (!isValidName(firstName)) {
    errors.push({ field: 'firstName', message: 'First name can only contain letters, spaces, hyphens, and apostrophes (2-50 characters)' });
  }
  
  // Sanitize and validate last name
  const lastName = sanitizeInput(data.lastName);
  if (!isValidName(lastName)) {
    errors.push({ field: 'lastName', message: 'Last name can only contain letters, spaces, hyphens, and apostrophes (2-50 characters)' });
  }
  
  // Validate date of birth
  const dobValidation = isValidDateOfBirth(data.dob);
  if (!dobValidation.valid) {
    errors.push({ field: 'dob', message: dobValidation.error || 'Invalid date of birth' });
  }
  
  // Validate gender
  if (!['Male', 'Female'].includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Gender must be Male or Female' });
  }
  
  // Validate blood type
  if (!isValidBloodType(data.bloodType)) {
    errors.push({ field: 'bloodType', message: 'Invalid blood type. Must be A+, A-, B+, B-, AB+, AB-, O+, or O-' });
  }
  
  // Validate contact number
  if (!isValidPhoneNumber(data.contact)) {
    errors.push({ field: 'contact', message: 'Contact must be a valid Philippine phone number (09XXXXXXXXX)' });
  }
  
  // Validate emergency contact number
  if (!isValidPhoneNumber(data.emergencyContactNumber)) {
    errors.push({ field: 'emergencyContactNumber', message: 'Emergency contact must be a valid Philippine phone number (09XXXXXXXXX)' });
  }
  
  // Validate PhilHealth number
  if (!isValidPhilHealth(data.philhealth)) {
    errors.push({ field: 'philhealth', message: 'PhilHealth number must be 12 digits' });
  }
  
  // Validate address length
  const addressError = maxLength(data.address, 200, 'address');
  if (addressError) errors.push(addressError);
  
  // Validate barangay
  const barangayMinError = minLength(data.barangay, 2, 'barangay');
  if (barangayMinError) errors.push(barangayMinError);
  
  // Validate emergency contact name
  const emergencyContactName = sanitizeInput(data.emergencyContact);
  if (!isValidName(emergencyContactName)) {
    errors.push({ field: 'emergencyContact', message: 'Emergency contact name can only contain letters, spaces, hyphens, and apostrophes' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  // Return sanitized data
  return {
    success: true,
    errors: [],
    data: {
      ...data,
      firstName: sanitizeInput(data.firstName),
      lastName: sanitizeInput(data.lastName),
      barangay: sanitizeInput(data.barangay),
      address: sanitizeInput(data.address),
      emergencyContact: sanitizeInput(data.emergencyContact),
      contact: data.contact.replace(/\s|-/g, ''),
      emergencyContactNumber: data.emergencyContactNumber.replace(/\s|-/g, ''),
      philhealth: data.philhealth.replace(/\s|-/g, ''),
    }
  };
}

// ============================================
// LOGIN FORM VALIDATION
// ============================================

export interface LoginFormInput {
  username: string;
  password: string;
}

export function validateLoginForm(data: LoginFormInput): ValidationResult<LoginFormInput> {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.username || data.username.trim() === '') {
    errors.push({ field: 'username', message: 'Username is required' });
  }
  
  if (!data.password || data.password === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  // Username validation
  if (data.username && data.username.length > 50) {
    errors.push({ field: 'username', message: 'Username must be 50 characters or less' });
  }
  
  // Password length check (basic)
  if (data.password && data.password.length > 100) {
    errors.push({ field: 'password', message: 'Password must be 100 characters or less' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return {
    success: true,
    errors: [],
    data: {
      username: sanitizeInput(data.username).toLowerCase(),
      password: data.password // Don't sanitize password
    }
  };
}

// ============================================
// PASSWORD CHANGE VALIDATION
// ============================================

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validatePasswordChange(data: PasswordChangeInput): ValidationResult<PasswordChangeInput> {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  
  if (!data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  }
  
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your new password' });
  }
  
  // Early return if required fields missing
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  // Check password strength
  const strength = validatePasswordStrength(data.newPassword);
  if (strength.strength === 'weak') {
    errors.push({ 
      field: 'newPassword', 
      message: `Password is too weak. ${strength.feedback.join('. ')}` 
    });
  }
  
  // Check passwords match
  if (data.newPassword !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  // Check new password is different from current
  if (data.newPassword === data.currentPassword) {
    errors.push({ field: 'newPassword', message: 'New password must be different from current password' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, errors: [], data };
}

// ============================================
// CONSULTATION FORM VALIDATION
// ============================================

export interface ConsultationFormInput {
  patientId: string;
  date: string;
  chiefComplaint: string;
  symptoms?: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  icdCode?: string;
  doctorId: string;
}

export function validateConsultationForm(data: ConsultationFormInput): ValidationResult<ConsultationFormInput> {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.patientId) {
    errors.push({ field: 'patientId', message: 'Patient is required' });
  }
  
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }
  
  if (!data.chiefComplaint || data.chiefComplaint.trim() === '') {
    errors.push({ field: 'chiefComplaint', message: 'Chief complaint is required' });
  }
  
  if (!data.diagnosis || data.diagnosis.trim() === '') {
    errors.push({ field: 'diagnosis', message: 'Diagnosis is required' });
  }
  
  if (!data.doctorId) {
    errors.push({ field: 'doctorId', message: 'Doctor is required' });
  }
  
  // Length validations
  if (data.chiefComplaint && data.chiefComplaint.length > 500) {
    errors.push({ field: 'chiefComplaint', message: 'Chief complaint must be 500 characters or less' });
  }
  
  if (data.symptoms && data.symptoms.length > 1000) {
    errors.push({ field: 'symptoms', message: 'Symptoms must be 1000 characters or less' });
  }
  
  if (data.diagnosis && data.diagnosis.length > 500) {
    errors.push({ field: 'diagnosis', message: 'Diagnosis must be 500 characters or less' });
  }
  
  if (data.treatment && data.treatment.length > 1000) {
    errors.push({ field: 'treatment', message: 'Treatment must be 1000 characters or less' });
  }
  
  if (data.notes && data.notes.length > 2000) {
    errors.push({ field: 'notes', message: 'Notes must be 2000 characters or less' });
  }
  
  // Validate date is not in future
  if (data.date) {
    const consultDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (consultDate > today) {
      errors.push({ field: 'date', message: 'Consultation date cannot be in the future' });
    }
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return {
    success: true,
    errors: [],
    data: {
      ...data,
      chiefComplaint: sanitizeInput(data.chiefComplaint),
      symptoms: data.symptoms ? sanitizeInput(data.symptoms) : undefined,
      diagnosis: sanitizeInput(data.diagnosis),
      treatment: data.treatment ? sanitizeInput(data.treatment) : undefined,
      notes: data.notes ? sanitizeInput(data.notes) : undefined,
      icdCode: data.icdCode ? sanitizeInput(data.icdCode) : undefined,
    }
  };
}

// ============================================
// APPOINTMENT FORM VALIDATION
// ============================================

export interface AppointmentFormInput {
  patientId: string;
  date: string;
  time: string;
  type: string;
  status?: string;
  notes?: string;
}

export function validateAppointmentForm(data: AppointmentFormInput): ValidationResult<AppointmentFormInput> {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.patientId) {
    errors.push({ field: 'patientId', message: 'Patient is required' });
  }
  
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }
  
  if (!data.time) {
    errors.push({ field: 'time', message: 'Time is required' });
  }
  
  if (!data.type || data.type.trim() === '') {
    errors.push({ field: 'type', message: 'Appointment type is required' });
  }
  
  // Validate appointment is not in the past
  if (data.date && data.time) {
    const appointmentDateTime = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    
    if (appointmentDateTime < now && !data.status) {
      errors.push({ field: 'date', message: 'Cannot schedule appointments in the past' });
    }
  }
  
  // Notes length
  if (data.notes && data.notes.length > 500) {
    errors.push({ field: 'notes', message: 'Notes must be 500 characters or less' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return {
    success: true,
    errors: [],
    data: {
      ...data,
      type: sanitizeInput(data.type),
      notes: data.notes ? sanitizeInput(data.notes) : undefined,
    }
  };
}

// ============================================
// STAFF FORM VALIDATION
// ============================================

export interface StaffFormInput {
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  contact: string;
  status?: string;
}

export function validateStaffForm(data: StaffFormInput): ValidationResult<StaffFormInput> {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.firstName || data.firstName.trim() === '') {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  
  if (!data.lastName || data.lastName.trim() === '') {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  
  if (!data.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  }
  
  if (!data.contact) {
    errors.push({ field: 'contact', message: 'Contact number is required' });
  }
  
  // Validate names
  if (data.firstName && !isValidName(data.firstName)) {
    errors.push({ field: 'firstName', message: 'First name can only contain letters, spaces, hyphens, and apostrophes' });
  }
  
  if (data.lastName && !isValidName(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' });
  }
  
  // Validate email if provided
  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  // Validate contact
  if (data.contact && !isValidPhoneNumber(data.contact)) {
    errors.push({ field: 'contact', message: 'Contact must be a valid Philippine phone number (09XXXXXXXXX)' });
  }
  
  // Validate role
  const validRoles = ['Admin', 'Doctor', 'Nurse', 'Midwife', 'BHW'];
  if (data.role && !validRoles.includes(data.role)) {
    errors.push({ field: 'role', message: `Role must be one of: ${validRoles.join(', ')}` });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return {
    success: true,
    errors: [],
    data: {
      ...data,
      firstName: sanitizeInput(data.firstName),
      lastName: sanitizeInput(data.lastName),
      email: data.email ? sanitizeInput(data.email).toLowerCase() : undefined,
      contact: data.contact.replace(/\s|-/g, ''),
    }
  };
}

// ============================================
// SEARCH VALIDATION
// ============================================

export function validateSearchInput(input: string): ValidationResult<string> {
  const errors: ValidationError[] = [];
  
  // Max length check
  if (input.length > 100) {
    errors.push({ field: 'search', message: 'Search query must be 100 characters or less' });
  }
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = /<script|javascript:|on\w+=/i;
  if (dangerousPatterns.test(input)) {
    errors.push({ field: 'search', message: 'Invalid search query' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return {
    success: true,
    errors: [],
    data: sanitizeInput(input).substring(0, 100)
  };
}

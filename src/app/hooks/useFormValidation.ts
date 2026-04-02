import { useState, useCallback } from 'react';
import type { ValidationResult, ValidationError } from '../utils/validation';

type ValidatorFn<T> = (data: T) => ValidationResult<T>;

/**
 * Hook for form validation with error state management
 * @param validator - Validation function that returns ValidationResult
 */
export function useFormValidation<T>(validator: ValidatorFn<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback((data: T): ValidationResult<T> => {
    const result = validator(data);
    
    if (!result.success) {
      const errorMap: Record<string, string> = {};
      result.errors.forEach((error: ValidationError) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      setIsValid(false);
    } else {
      setErrors({});
      setIsValid(true);
    }
    
    return result;
  }, [validator]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    setIsValid(false);
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  const hasError = useCallback((field: string): boolean => {
    return field in errors;
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldError,
    hasError,
  };
}

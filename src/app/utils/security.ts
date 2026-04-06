/**
 * Security Utilities
 * Input validation, sanitization, and security helper functions
 */

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes or escapes potentially dangerous HTML characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate Philippine phone number format
 * Accepts: 09XXXXXXXXX (11 digits starting with 09)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate PhilHealth number format
 * Format: 12 digits
 */
export function isValidPhilHealth(philhealth: string): boolean {
  const philhealthRegex = /^\d{12}$/;
  return philhealthRegex.test(philhealth.replace(/\s|-/g, ''));
}

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
}

/**
 * Validate date of birth (not in future, reasonable age)
 */
export function isValidDateOfBirth(dob: string): { valid: boolean; error?: string } {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (birthDate > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }
  
  if (age > 150) {
    return { valid: false, error: 'Invalid age (too old)' };
  }
  
  if (age < 0) {
    return { valid: false, error: 'Invalid age' };
  }
  
  return { valid: true };
}

/**
 * Validate blood type
 */
export function isValidBloodType(bloodType: string): boolean {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validTypes.includes(bloodType.toUpperCase());
}

/**
 * Validate password strength
 * Returns strength score and feedback
 */
export function validatePasswordStrength(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');
  
  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) score++;
  else feedback.push('Add numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push('Add special characters');
  
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 4) strength = 'good';
  else if (score >= 3) strength = 'fair';
  
  return { score, strength, feedback };
}

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate limited
 * @param key Unique identifier (e.g., 'login', 'password-reset')
 * @param maxAttempts Maximum attempts allowed
 * @param windowMs Time window in milliseconds
 * @param lockoutMs Lockout duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  lockoutMs: number = 15 * 60 * 1000  // 15 minutes lockout
): { allowed: boolean; remainingAttempts: number; lockedUntil: Date | null; message?: string } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // Check if currently locked out
  if (entry?.lockedUntil && now < entry.lockedUntil) {
    const unlockTime = new Date(entry.lockedUntil);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: unlockTime,
      message: `Too many attempts. Try again at ${unlockTime.toLocaleTimeString()}`
    };
  }
  
  // Reset if window has expired or first attempt
  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
      lockedUntil: null
    });
    return { allowed: true, remainingAttempts: maxAttempts - 1, lockedUntil: null };
  }
  
  // Increment attempts
  entry.attempts++;
  
  // Check if should lock out
  if (entry.attempts >= maxAttempts) {
    entry.lockedUntil = now + lockoutMs;
    rateLimitStore.set(key, entry);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(entry.lockedUntil),
      message: `Account locked for ${Math.ceil(lockoutMs / 60000)} minutes due to too many failed attempts`
    };
  }
  
  rateLimitStore.set(key, entry);
  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.attempts,
    lockedUntil: null
  };
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get remaining lockout time in seconds
 */
export function getRemainingLockoutTime(key: string): number {
  const entry = rateLimitStore.get(key);
  if (!entry?.lockedUntil) return 0;
  
  const remaining = entry.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

// ============================================
// SESSION SECURITY
// ============================================

const SESSION_ACTIVITY_KEY = 'healthwatch_last_activity';
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  localStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Get last activity timestamp
 */
export function getLastActivity(): number {
  const stored = localStorage.getItem(SESSION_ACTIVITY_KEY);
  return stored ? parseInt(stored, 10) : Date.now();
}

/**
 * Check if session has timed out
 */
export function isSessionTimedOut(timeoutMs: number = DEFAULT_SESSION_TIMEOUT): boolean {
  const lastActivity = getLastActivity();
  return Date.now() - lastActivity > timeoutMs;
}

/**
 * Clear session activity data
 */
export function clearSessionActivity(): void {
  localStorage.removeItem(SESSION_ACTIVITY_KEY);
}

// ============================================
// DATA MASKING
// ============================================

/**
 * Mask sensitive data for display (e.g., phone numbers, IDs)
 */
export function maskSensitiveData(data: string, visibleStart: number = 2, visibleEnd: number = 2): string {
  if (!data || data.length <= visibleStart + visibleEnd) return data;
  
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const masked = '*'.repeat(data.length - visibleStart - visibleEnd);
  
  return `${start}${masked}${end}`;
}

/**
 * Mask email address
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local[0] + '*';
  
  return `${maskedLocal}@${domain}`;
}

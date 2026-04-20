import { Request, Response, NextFunction } from 'express';
import { StaffRole, UserRole } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        staffRole?: StaffRole;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: UserRole;
    staffRole?: StaffRole;
  };
}

// Pagination query params
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search query params
export interface SearchQuery extends PaginationQuery {
  search?: string;
  status?: string;
}

// Date range query params
export interface DateRangeQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
}

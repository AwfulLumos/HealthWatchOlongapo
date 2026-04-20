import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign parsed values back onto the request so that:
      // - unknown keys are stripped (Zod default)
      // - preprocess/transform results are applied
      // Only overwrite fields that the schema actually returned.
      if (Object.prototype.hasOwnProperty.call(parsed, 'body')) {
        (req as unknown as { body: unknown }).body = parsed.body;
      }
      if (Object.prototype.hasOwnProperty.call(parsed, 'query')) {
        try {
          // Express 5 defines req.query via getter in some setups.
          (req as unknown as { query: unknown }).query = parsed.query;
        } catch {
          try {
            // Override inherited getter with own data property so downstream handlers
            // always receive normalized/typed query values from Zod.
            Object.defineProperty(req, 'query', {
              value: parsed.query,
              writable: true,
              configurable: true,
              enumerable: true,
            });
          } catch {
            const currentQuery = req.query as Record<string, unknown>;
            if (currentQuery && typeof currentQuery === 'object') {
              Object.keys(currentQuery).forEach((key) => {
                delete currentQuery[key];
              });
              Object.assign(currentQuery, parsed.query as Record<string, unknown>);
            }
          }
        }
      }
      if (Object.prototype.hasOwnProperty.call(parsed, 'params')) {
        (req as unknown as { params: unknown }).params = parsed.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const path = e.path.slice(1).join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(e.message);
        });
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

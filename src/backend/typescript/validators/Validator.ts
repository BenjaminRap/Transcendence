import { ZodSchema, ZodError } from 'zod';

/**
 * Erreur de validation formatée
 */
export interface ValidationError {
    field:      string;
    message:    string;
}

/**
 * Résultat de validation
 */
export interface ValidationResult<T> {
    success:    boolean;
    data?:      T;
    errors?:    ValidationError[];
}


/**
 * Classe générique de validation
 */
export class Validator {
    // valid data from zod schema, returns ValidationResult
    static validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
        try {
            const validatedData = schema.parse(data);

            return {
                success: true,
                data: validatedData,
            };
        } catch (error) {
            if (error instanceof ZodError)
                return { success: false, errors: this.formatZodErrors(error) };
            
            return {
                success: false,
                errors: [{ field: 'unknown', message: 'Validation failed' }],
            };
        }
    }

    // ================================== PRIVATE ================================== //

    // Zod error formatted in readable format
    private static formatZodErrors(error: ZodError): ValidationError[] {
        return error.errors.map((err) => ({
            field: err.path.join('.') || 'unknown',
            message: err.message,
        }));
    }
}
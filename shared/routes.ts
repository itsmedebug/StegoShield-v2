
import { z } from 'zod';
import { insertLogSchema, logs, encodeMetaSchema, decodeMetaSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  stego: {
    encode: {
      method: 'POST' as const,
      path: '/api/stego/encode',
      // Input is FormData, handled separately, but this schema validates the metadata fields
      input: encodeMetaSchema, 
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string().optional(),
          downloadUrl: z.string().optional(),
          meta: z.object({
            capacityUsed: z.string().optional(),
            originalSize: z.string().optional(),
          }).optional()
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    decode: {
      method: 'POST' as const,
      path: '/api/stego/decode',
      input: decodeMetaSchema,
      responses: {
        200: z.object({
          success: z.boolean(),
          data: z.string().optional(),
          message: z.string().optional(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    capacity: {
      method: 'POST' as const,
      path: '/api/stego/capacity',
      // Input is FormData (image file)
      responses: {
        200: z.object({
          totalBytes: z.number(),
          safeBytes: z.number(),
          width: z.number(),
          height: z.number(),
        }),
        400: errorSchemas.validation,
      },
    }
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/logs',
      responses: {
        204: z.void(),
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

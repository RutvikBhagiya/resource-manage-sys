import { z } from "zod"

export function validate<T>(schema: z.ZodType<T>,data: unknown):
  | { success: true; data: T }
  | { success: false; response: Response } {

  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      response: Response.json(
        {
          errors: result.error.issues.map(issue => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 422 }
      ),
    }
  }

  return { success: true, data: result.data }
}

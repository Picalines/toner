import type { ZodSchema, ZodTypeDef } from 'zod'

export function safeParseOr<I, O, D extends ZodTypeDef>(
	schema: ZodSchema<O, D, I>,
	input: unknown,
	defaultValue: O,
) {
	const result = schema.safeParse(input)
	return result.success ? result.data : defaultValue
}

export function zodIs<I, O, D extends ZodTypeDef>(
	schema: ZodSchema<O, D, I>,
	input: unknown,
): input is O {
	const { success } = schema.safeParse(input)
	return success
}

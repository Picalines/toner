import { ZodSchema, ZodTypeDef } from 'zod'

export function safeParseOr<I, O, D extends ZodTypeDef>(
	schema: ZodSchema<O, D, I>,
	input: I,
	defaultValue: O,
) {
	const result = schema.safeParse(input)
	return result.success ? result.data : defaultValue
}

import { Primitive, ZodLiteral, ZodSchema, ZodTypeDef, ZodUnion, z } from 'zod'

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

export function zodLiteralUnion<TValues extends [Primitive, ...Primitive[]]>(
	...values: TValues
): ZodUnion<{ [I in keyof TValues]: ZodLiteral<TValues[I]> }> {
	// @ts-expect-error map() returns T[] but zod expects [T, ...T[]]
	return z.union(values.map(v => z.literal(v)))
}

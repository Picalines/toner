export type DeepReadonly<T> = T extends {
	[K in keyof T]: unknown
}
	? { readonly [K in keyof T]: DeepReadonly<T[K]> }
	: T

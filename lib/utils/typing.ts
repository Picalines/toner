export type PropsWithoutChildren<P> = Omit<P, 'children'>

export type DeepReadonly<T> = T extends {
	[K in keyof T]: unknown
}
	? { readonly [K in keyof T]: DeepReadonly<T[K]> }
	: T

export type KeyOfUnion<T> = T extends T ? keyof T : never

type TupleImpl<Item, Length extends number, Acc extends Item[]> = Acc extends {
	length: Length
}
	? Acc
	: TupleImpl<Item, Length, [...Acc, Item]>

export type Tuple<
	Item,
	Length extends number,
> = `${Length}` extends `-${string}` ? never : TupleImpl<Item, Length, []>

type IntRangeImpl<Stop extends number, Acc extends number[]> = Acc extends {
	length: Stop
}
	? Acc
	: IntRangeImpl<Stop, [...Acc, Acc['length']]>

export type IntRange<Length extends number> = `${Length}` extends `-${string}`
	? never
	: IntRangeImpl<Length, []>

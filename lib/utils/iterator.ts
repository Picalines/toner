export function range(stop: number): Generator<number>
export function range(start: number, stop: number): Generator<number>
export function range(
	start: number,
	stop: number,
	step: number,
): Generator<number>
export function* range(
	...args: [number] | [number, number] | [number, number, number]
): Generator<number> {
	let start, stop, step: number

	if (args.length == 3) {
		;[start, stop, step] = args
	} else if (args.length == 2) {
		;[start, stop, step] = [...args, 1]
	} else {
		;[start, stop, step] = [0, ...args, 1]
	}

	if (step == 0) {
		throw new Error(`${range.name} called with step = 0`)
	}

	const shouldStop =
		step > 0
			? (current: number) => current < stop
			: (current: number) => current > stop

	for (let current = start; shouldStop(current); current += step) {
		yield current
	}
}

export function* takeWhile<T>(
	iterable: Iterable<T>,
	predicate: (item: T) => boolean,
): Generator<T> {
	for (const item of iterable) {
		if (!predicate(item)) {
			break
		}

		yield item
	}
}

export function* takeWhileFromEnd<T>(
	array: readonly T[],
	predicate: (item: T) => boolean,
): Generator<T> {
	for (let i = array.length - 1; i >= 0; i--) {
		const item = array[i]

		if (!predicate(item)) {
			break
		}

		yield item
	}
}

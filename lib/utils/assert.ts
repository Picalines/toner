export function assertUnreachable(value: never): never {
	throw new Error(`${assertUnreachable.name} called`, { cause: value })
}

export function mapRange(
	value: number,
	[min1, max1]: [min: number, max: number],
	[min2, max2]: [min: number, max: number],
) {
	const t = (value - min1) / (max1 - min1)
	return min2 + (max2 - min2) * t
}

export function trimFraction(value: number, maxDigits: number): number {
	return Number(value.toFixed(maxDigits))
}

export function step(value: number, stepWidth: number): number {
	return value - (value % stepWidth)
}

export function clampLeft(value: number, min: number, max: number) {
	return Math.max(min, Math.min(value, max))
}

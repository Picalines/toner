export function keyString(note: string, octave: number, isAccidental = false) {
	return note[0] + (isAccidental ? '#' : '') + octave
}

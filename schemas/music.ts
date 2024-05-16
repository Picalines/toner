import { z } from 'zod'
import { IntRange, zodIs } from '@/lib/utils'

export const NATURAL_NOTES_COUNT = 7

export const OCTAVE_LENGTH = 12

export const MAX_OCTAVE = 9

export const NUMBER_OF_NOTES = OCTAVE_LENGTH * (MAX_OCTAVE + 1)

const noteSchema = z.number().int().min(0).max(NUMBER_OF_NOTES)

export const musicSchemas = {
	note: noteSchema,

	key: z.object({
		note: noteSchema,
		time: z.number().min(0),
		duration: z.number().min(0.001),
		velocity: z.number().min(0).max(1),
	}),
}

export type MusicNote = z.infer<(typeof musicSchemas)['note']>

export type MusicKey = z.infer<(typeof musicSchemas)['key']>

type NoteSymbol =
	| 'C'
	| 'C#'
	| 'D'
	| 'D#'
	| 'E'
	| 'F'
	| 'F#'
	| 'G'
	| 'G#'
	| 'A'
	| 'A#'
	| 'B'

export const NOTE_SYMBOLS = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B',
] as const satisfies NoteSymbol[]

type NoteOctave = IntRange<typeof MAX_OCTAVE>[number] | typeof MAX_OCTAVE

type MusicKeyString = `${NoteSymbol}${NoteOctave}`

type NoteInfo = {
	octave: number
	octaveHalfStep: number
	symbol: NoteSymbol
	accidental: boolean
	keyString: MusicKeyString
}

const noteInfos: NoteInfo[] = Array.from({ length: NUMBER_OF_NOTES }).map(
	(_, absoluteHalfSteps) => {
		const octave = Math.floor(absoluteHalfSteps / OCTAVE_LENGTH)

		const octaveHalfStep = absoluteHalfSteps % OCTAVE_LENGTH
		const symbol = NOTE_SYMBOLS[octaveHalfStep]

		return {
			octave,
			octaveHalfStep,
			symbol,
			accidental: symbol.endsWith('#'),
			keyString: `${symbol}${octave}` as MusicKeyString,
		}
	},
)

export function musicNoteInfo(absoluteHalfSteps: number): NoteInfo {
	if (!zodIs(noteSchema, absoluteHalfSteps)) {
		throw new Error(`invalid note ${String(absoluteHalfSteps)}`)
	}

	return noteInfos[absoluteHalfSteps]
}

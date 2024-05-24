import { z } from 'zod'
import { IntRange } from '@/lib/utils'
import { audioNodeSchemas } from './audio-node'

export const MUSIC_NATURAL_NOTES = 7

export const MUSIC_OCTAVE_LENGTH = 12

export const MAX_MUSIC_OCTAVE = 9

export const MAX_MUSIC_NOTE = MUSIC_OCTAVE_LENGTH * (MAX_MUSIC_OCTAVE + 1)

const layerId = z.string().min(1).max(36)

const noteSchema = z.number().int().min(0).max(MAX_MUSIC_NOTE)

export const musicSchemas = {
	note: noteSchema,

	layer: {
		id: layerId,
		name: z.string().trim().min(1).max(32),
	},

	key: {
		id: z.string().min(1).max(36),
		layerId,
		instrumentId: audioNodeSchemas.nodeId,
		note: noteSchema,
		time: z.number().min(0),
		duration: z.number().min(0.001),
		velocity: z.number().min(0).max(1),
	},
}

export const MUSIC_NOTE_SYMBOLS = [
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
] as const

export type MusicLayerId = z.infer<typeof layerId>

export type MusicKeyId = z.infer<(typeof musicSchemas)['key']['id']>

export type MusicNoteSymbol = (typeof MUSIC_NOTE_SYMBOLS)[number]

export type MusicNoteOctave =
	| IntRange<typeof MAX_MUSIC_OCTAVE>[number]
	| typeof MAX_MUSIC_OCTAVE

export type MusicKeyString = `${MusicNoteSymbol}${MusicNoteOctave}`

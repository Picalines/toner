import { z } from 'zod'
import { IntRange } from '@/lib/utils'
import { audioNodeSchemas } from './audio-node'

export const MUSIC_NATURAL_NOTES = 7

export const MUSIC_OCTAVE_LENGTH = 12

export const MAX_MUSIC_OCTAVE = 9

export const MAX_MUSIC_NOTE = MUSIC_OCTAVE_LENGTH * (MAX_MUSIC_OCTAVE + 1) - 1

const layerId = z.string().min(1).max(36)
const layerName = z.string().trim().min(1).max(32)

const keyId = z.string().min(1).max(36)
const keyNote = z.number().int().min(0).max(MAX_MUSIC_NOTE)
const keyTime = z.number().min(0)
const keyDuration = z.number().min(0.001)
const keyVelocity = z.number().min(0).max(1)

export const musicSchemas = {
	note: keyNote,

	keyId,
	keyNote,
	keyTime,
	keyDuration,
	keyVelocity,

	layerId,
	layerName,

	layer: z.object({
		id: layerId,
		name: layerName,
	}),

	key: z.object({
		id: keyId,
		layerId,
		instrumentId: audioNodeSchemas.nodeId,
		note: keyNote,
		time: keyTime,
		duration: keyDuration,
		velocity: keyVelocity,
	}),
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

export type MusicKeyId = z.infer<typeof keyId>

export type MusicKey = z.infer<(typeof musicSchemas)['key']>

export type MusicLayer = z.infer<(typeof musicSchemas)['layer']>

export type MusicNoteSymbol = (typeof MUSIC_NOTE_SYMBOLS)[number]

export type MusicNoteOctave =
	| IntRange<typeof MAX_MUSIC_OCTAVE>[number]
	| typeof MAX_MUSIC_OCTAVE

export type MusicKeyString = `${MusicNoteSymbol}${MusicNoteOctave}`

import {
	MAX_MUSIC_NOTE,
	MUSIC_NOTE_SYMBOLS,
	MUSIC_OCTAVE_LENGTH,
	MusicKeyString,
	MusicNoteSymbol,
	musicSchemas,
} from '@/lib/schemas/music'
import { zodIs } from '../utils'

type NoteInfo = {
	octave: number
	octaveHalfStep: number
	symbol: MusicNoteSymbol
	accidental: boolean
	keyString: MusicKeyString
}

const noteInfos: NoteInfo[] = Array.from({ length: MAX_MUSIC_NOTE + 1 }).map(
	(_, absoluteHalfSteps) => {
		const octave = Math.floor(absoluteHalfSteps / MUSIC_OCTAVE_LENGTH)

		const octaveHalfStep = absoluteHalfSteps % MUSIC_OCTAVE_LENGTH
		const symbol = MUSIC_NOTE_SYMBOLS[octaveHalfStep]

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
	if (!zodIs(musicSchemas.note, absoluteHalfSteps)) {
		throw new Error(`invalid note ${String(absoluteHalfSteps)}`)
	}

	return noteInfos[absoluteHalfSteps]
}

import { PolySynth, ToneEvent } from 'tone'
import { musicNoteInfo } from '../music'
import { MusicKey } from '../schemas/music'
import { ToneStoreApi } from '../stores'

export function musicKeyToToneEvent(
	musicKey: MusicKey,
	toneStoreApi: ToneStoreApi,
): ToneEvent {
	const { time: startTime, note, duration, instrumentId } = musicKey

	const { keyString: musicKeyString } = musicNoteInfo(note)

	const durationNotation = `0:0:${duration}`

	const event = new ToneEvent(eventTime => {
		const { getToneNodeById } = toneStoreApi.getState()
		const synth = getToneNodeById(instrumentId)
		if (!(synth instanceof PolySynth)) {
			return
		}

		synth.triggerAttackRelease(musicKeyString, durationNotation, eventTime)
	})

	// NOTE: ToneEvent needs to be recreated when the musicKey gets moved
	event.start(`0:0:${startTime}`) // 0 bars, 0 quarters, time sixteenths

	return event
}

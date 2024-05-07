'use client'

import { useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { cn, keyString } from '@/lib/utils'
import KeyAreaBackground from '@/components/editor/key-area-background'
import PianoRoll, { KeyEvent } from '@/components/editor/piano-roll'
import { useToneStore } from '../providers/tone-store-provider'

type Props = Readonly<{
	className?: string
}>

export default function KeyEditor({ className }: Props) {
	const debugSynthRef = useRef<Tone.PolySynth | null>(null)
	const resumeContext = useToneStore(tone => tone.resumeContext)
	const addNode = useToneStore(tone => tone.addNode)
	const disposeNode = useToneStore(tone => tone.disposeNode)

	useEffect(() => {
		const synth = new Tone.PolySynth(Tone.Synth)
		const reverb = new Tone.Reverb(1)
		synth.connect(reverb)
		reverb.toDestination()
		addNode((debugSynthRef.current = synth))
		return () => disposeNode(synth)
	}, [addNode, disposeNode])

	const onKeyDown = useCallback(
		async ({ note, octave, isAccidental }: KeyEvent) => {
			await resumeContext()
			debugSynthRef.current!.triggerAttack(
				keyString(note, octave, isAccidental),
				Tone.now(),
			)
		},
		[resumeContext],
	)

	const onKeyUp = useCallback(({ note, octave, isAccidental }: KeyEvent) => {
		debugSynthRef.current!.triggerRelease(
			[keyString(note, octave, isAccidental)],
			Tone.now(),
		)
	}, [])

	return (
		<div className={cn('relative', className)}>
			<PianoRoll
				className="absolute left-0 w-20"
				lineHeight={24}
				onKeyDown={onKeyDown}
				onKeyUp={onKeyUp}
			/>
			<KeyAreaBackground
				className="w-full"
				lineHeight={24}
				numberOfLines={120}
			/>
		</div>
	)
}

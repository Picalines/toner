'use client'

import { useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { cn } from '@/lib/utils'
import { musicNoteInfo } from '@/schemas/music'
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
		addNode('DEBUG', (debugSynthRef.current = synth))
		return () => disposeNode('DEBUG')
	}, [addNode, disposeNode])

	const onKeyDown = useCallback(
		async ({ note }: KeyEvent) => {
			await resumeContext()
			const { keyString } = musicNoteInfo(note)
			debugSynthRef.current!.triggerAttack(keyString, Tone.now())
		},
		[resumeContext],
	)

	const onKeyUp = useCallback(({ note }: KeyEvent) => {
		const { keyString } = musicNoteInfo(note)
		debugSynthRef.current!.triggerRelease([keyString], Tone.now())
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

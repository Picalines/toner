'use client'

import { useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { cn } from '@/lib/utils'
import KeyAreaBackground from '@/components/editor/key-area-background'
import PianoRoll, { KeyEvent } from '@/components/editor/piano-roll'
import { useToneStore } from '../providers/tone-store-provider'

type Props = Readonly<{
	className?: string
}>

export default function KeyEditorPanel({ className }: Props) {
	const debugSynthRef = useRef<Tone.Synth | null>(null)
	const resumeContext = useToneStore(tone => tone.resumeContext)
	const addNode = useToneStore(tone => tone.addNode)
	const disposeNode = useToneStore(tone => tone.disposeNode)

	useEffect(() => {
		const synth = new Tone.Synth()
		const reverb = new Tone.Reverb(1)
		synth.connect(reverb)
		reverb.toDestination()
		addNode((debugSynthRef.current = synth))
		return () => disposeNode(synth)
	}, [addNode, disposeNode])

	const onKeyDown = useCallback(
		async ({ note, octave }: KeyEvent) => {
			await resumeContext()
			debugSynthRef.current!.triggerAttack(
				note + octave,
				Tone.immediate(),
			)
		},
		[resumeContext],
	)

	const onKeyUp = useCallback(() => {
		debugSynthRef.current!.triggerRelease(Tone.now())
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

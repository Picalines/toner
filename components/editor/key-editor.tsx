'use client'

import { useCallback, useEffect, useState } from 'react'
import * as Tone from 'tone'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { AudioNodeId, audioNodeDefinitions } from '@/schemas/audio-node'
import { musicNoteInfo } from '@/schemas/music'
import KeyAreaBackground from '@/components/editor/key-area-background'
import PianoRoll, { KeyEvent } from '@/components/editor/piano-roll'
import { CompositionStore } from '@/stores/composition-store'
import { ToneStore } from '@/stores/tone-store'
import { useCompositionStore } from '../providers/composition-store-provider'
import { useToneStore } from '../providers/tone-store-provider'

type Props = Readonly<{
	className?: string
}>

const toneSelector = ({
	isAudioAvailable,
	resumeContext,
	getNodeById,
}: ToneStore) => ({
	isAudioAvailable,
	resumeContext,
	getNodeById,
})

const compositionSelector = ({
	selectedNodeId,
	getNodeById,
}: CompositionStore) => ({
	selectedNodeId,
	getNodeById,
})

export default function KeyEditor({ className }: Props) {
	const {
		isAudioAvailable,
		resumeContext,
		getNodeById: getToneNode,
	} = useToneStore(useShallow(toneSelector))

	const { selectedNodeId, getNodeById: getAudioNode } = useCompositionStore(
		useShallow(compositionSelector),
	)

	const [instrumentId, setInstrumentId] = useState<AudioNodeId | null>(null)

	useEffect(() => {
		const audioNode = selectedNodeId ? getAudioNode(selectedNodeId) : null
		if (!audioNode) {
			return
		}

		const {
			data: { type: nodeType },
		} = audioNode
		const { group } = audioNodeDefinitions[nodeType]

		if (group == 'instrument') {
			setInstrumentId(selectedNodeId)
		}
	}, [isAudioAvailable, selectedNodeId, getAudioNode])

	const onKeyDown = useCallback(
		async ({ note }: KeyEvent) => {
			await resumeContext()

			const synthNode = instrumentId ? getToneNode(instrumentId) : null
			if (!(synthNode instanceof Tone.PolySynth) || synthNode.disposed) {
				return
			}

			synthNode.triggerAttack(musicNoteInfo(note).keyString, Tone.now())
		},
		[resumeContext, instrumentId, getToneNode],
	)

	const onKeyUp = useCallback(
		({ note }: KeyEvent) => {
			const synthNode = instrumentId ? getToneNode(instrumentId) : null
			if (!(synthNode instanceof Tone.PolySynth) || synthNode.disposed) {
				return
			}

			synthNode.triggerRelease(
				[musicNoteInfo(note).keyString],
				Tone.now(),
			)
		},
		[instrumentId, getToneNode],
	)

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

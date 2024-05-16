'use client'

import { useCallback } from 'react'
import * as Tone from 'tone'
import { cn } from '@/lib/utils'
import { musicNoteInfo } from '@/schemas/music'
import MusicKeyEditorBackground from '@/components/editor/music-key-editor-background'
import PianoRoll, { KeyEvent } from '@/components/editor/piano-roll'
import { useEditorStoreApi } from '../providers/editor-store-provider'
import { useToneStoreApi } from '../providers/tone-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '../ui/resizable'

type Props = Readonly<{
	className?: string
}>

export default function MusicKeyEditor({ className }: Props) {
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	const onKeyDown = useCallback(
		async ({ note }: KeyEvent) => {
			const { selectedInstrumentId: instrumentId } =
				editorStore.getState()
			const { resumeContext, getNodeById: getToneNode } =
				toneStore.getState()

			await resumeContext()

			const synthNode = instrumentId ? getToneNode(instrumentId) : null
			if (!(synthNode instanceof Tone.PolySynth) || synthNode.disposed) {
				return
			}

			synthNode.triggerAttack(musicNoteInfo(note).keyString, Tone.now())
		},
		[editorStore, toneStore],
	)

	const onKeyUp = useCallback(
		({ note }: KeyEvent) => {
			const { selectedInstrumentId: instrumentId } =
				editorStore.getState()
			const { getNodeById: getToneNode } = toneStore.getState()

			const synthNode = instrumentId ? getToneNode(instrumentId) : null
			if (!(synthNode instanceof Tone.PolySynth) || synthNode.disposed) {
				return
			}

			synthNode.triggerRelease(
				[musicNoteInfo(note).keyString],
				Tone.now(),
			)
		},
		[editorStore, toneStore],
	)

	return (
		<ResizablePanelGroup
			className={cn('relative', className)}
			direction="horizontal"
		>
			<ResizablePanel defaultSize={20} maxSize={40}>
				<PianoRoll
					className="left-0 w-full"
					lineHeight={24}
					onKeyDown={onKeyDown}
					onKeyUp={onKeyUp}
				/>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={80}>
				<MusicKeyEditorBackground
					className="w-full"
					lineHeight={24}
					numberOfLines={120}
				/>
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}

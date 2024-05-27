'use client'

import { useCallback } from 'react'
import * as Tone from 'tone'
import { musicNoteInfo } from '@/lib/music'
import { cn } from '@/lib/utils'
import PianoRoll, { KeyEvent } from '@/components/editor/piano-roll'
import { useEditorStoreApi } from '../providers/editor-store-provider'
import { useToneStoreApi } from '../providers/tone-store-provider'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '../ui/resizable'
import EditorTimeline from './editor-timeline'
import MusicKeyFlow from './music-key-flow'
import MusicLayerSelector from './music-layer-selector'

type Props = Readonly<{
	className?: string
}>

// TODO: zoom on alt+wheel
const DEFAULT_NOTE_WIDTH = 120

const NOTE_LINE_HEIGHT = 24

export default function MusicKeyEditor({ className }: Props) {
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	const onKeyDown = useCallback(
		async ({ note }: KeyEvent) => {
			const { playbackInstrumentId: instrumentId } =
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
			const { playbackInstrumentId: instrumentId } =
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
			className={cn('relative !overflow-clip', className)}
			direction="horizontal"
		>
			<ResizablePanel
				defaultSize={20}
				maxSize={40}
				className="!overflow-clip"
			>
				<MusicLayerSelector className="sticky top-0 z-10 h-6 w-full border-b" />
				<PianoRoll
					className="w-full"
					lineHeight={NOTE_LINE_HEIGHT}
					onKeyDown={onKeyDown}
					onKeyUp={onKeyUp}
				/>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={80} className="!overflow-clip">
				<EditorTimeline
					className="sticky top-0 z-10 h-6 border-b"
					columnWidth={DEFAULT_NOTE_WIDTH}
				/>
				<MusicKeyFlow
					className="w-full"
					noteWidth={DEFAULT_NOTE_WIDTH}
					lineHeight={NOTE_LINE_HEIGHT}
				/>
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}

'use client'

import { useAnimationFrame } from 'framer-motion'
import { ElementRef, useRef } from 'react'
import { useStore } from 'zustand'
import type {
	EditorPlaybackState,
	EditorStore,
} from '@/lib/stores/editor-store'
import { cn, tw } from '@/lib/utils'
import { useEditorStoreApi } from '../providers/editor-store-provider'
import { useToneStoreApi } from '../providers/tone-store-provider'

type Props = { noteWidth?: number; className?: string }

const TICKS_IN_QUARTER_NOTE = 192
const TICKS_IN_NOTE = TICKS_IN_QUARTER_NOTE * 4

const playbackStateSelector = ({ playbackState }: EditorStore) => playbackState

const playbackLineClassNames: { [T in EditorPlaybackState]?: string } = {
	idle: tw`fill-transparent`,
	playing: tw`fill-green-500`,
	paused: tw`animate-pulse fill-green-600`,
}

export default function EditorPlaybackLine({
	noteWidth = 40,
	className,
}: Props) {
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	const playbackState = useStore(editorStore, playbackStateSelector)

	const rectRef = useRef<ElementRef<'rect'>>(null)

	useAnimationFrame(() => {
		if (!rectRef.current || playbackState == 'idle') {
			return
		}

		const {
			context: { lookAhead },
			transport,
		} = toneStore.getState()
		const { timelineScroll } = editorStore.getState()

		const notes = Math.max(
			0,
			(transport.ticks - transport.toTicks(lookAhead)) / TICKS_IN_NOTE,
		)

		rectRef.current.setAttribute(
			'x',
			String(notes * noteWidth - timelineScroll),
		)
	})

	return (
		<div className={cn('pointer-events-none overflow-hidden', className)}>
			<svg width="100%" height="100%" overflow="visible">
				<rect
					ref={rectRef}
					x={0}
					y={0}
					width={1}
					height="100%"
					className={cn(
						'transition',
						playbackLineClassNames[playbackState],
					)}
				/>
			</svg>
		</div>
	)
}

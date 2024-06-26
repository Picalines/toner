'use client'

import {
	Loader2Icon,
	type LucideIcon,
	PauseIcon,
	PlayIcon,
	RepeatIcon,
	SquareIcon,
} from 'lucide-react'
import { PolySynth } from 'tone'
import { useStore } from 'zustand'
import { withClassName } from '@/lib/hocs/with-class-name'
import type {
	EditorPlaybackState,
	EditorStore,
} from '@/lib/stores/editor-store'
import { cn, tw } from '@/lib/utils'
import { useEditorStoreApi } from '../providers/editor-store-provider'
import { useToneStoreApi } from '../providers/tone-store-provider'
import { Button } from '../ui/button'

type Props = Readonly<{
	className?: string
}>

const playbackStateSelector = ({ playbackState }: EditorStore) => playbackState

const playButtonIcons: { [T in EditorPlaybackState]: LucideIcon } = {
	idle: PlayIcon,
	initializing: withClassName(
		Loader2Icon,
		tw`pointer-events-none animate-spin`,
	),
	playing: PauseIcon,
	paused: withClassName(PlayIcon, tw`animate-pulse`),
}

export default function EditorPlaybackControls({ className }: Props) {
	const editorStore = useEditorStoreApi()
	const toneStore = useToneStoreApi()

	const playbackState = useStore(editorStore, playbackStateSelector)

	const stopAllInstruments = () => {
		const { toneNodes } = toneStore.getState()

		for (const toneNode of toneNodes.values()) {
			if (toneNode instanceof PolySynth) {
				toneNode.releaseAll()
			}
		}
	}

	const onPlayClick = async () => {
		const { setPlaybackState } = editorStore.getState()
		const { resumeContext, transport } = toneStore.getState()

		switch (playbackState) {
			case 'idle': {
				setPlaybackState('initializing')
				await resumeContext()
				transport.start()
				setPlaybackState('playing')
				break
			}

			case 'playing': {
				transport.pause()
				stopAllInstruments()
				setPlaybackState('paused')
				break
			}

			case 'paused': {
				// TODO: doesn't work actually, need to investigate
				transport.start(undefined, transport.ticks + 'i')
				setPlaybackState('playing')
				break
			}
		}
	}

	const onStopClick = () => {
		const { setPlaybackState } = editorStore.getState()
		const { transport } = toneStore.getState()

		transport.stop(transport.immediate())
		stopAllInstruments()

		setPlaybackState('idle')
	}

	const PlayButtonIcon = playButtonIcons[playbackState]

	const noFocusRing = tw`focus-visible:ring-transparent focus-visible:ring-offset-transparent`

	return (
		<div className={cn('flex w-min flex-row rounded-lg border', className)}>
			<Button
				variant="ghost"
				className={cn(
					'group aspect-square rounded-r-none p-2',
					noFocusRing,
					playbackState != 'idle' && 'bg-accent/50',
				)}
				onClick={onPlayClick}
			>
				<PlayButtonIcon className="h-4 w-4 text-green-500 transition group-active:scale-75 dark:text-green-400" />
			</Button>
			<Button
				variant="ghost"
				className={cn(
					'group aspect-square rounded-none p-2',
					noFocusRing,
				)}
				onClick={onStopClick}
			>
				<SquareIcon
					className={cn(
						'h-4 w-4 transition group-active:scale-75',
						playbackState == 'idle'
							? 'text-neutral-500'
							: 'text-red-500 dark:text-red-400',
					)}
				/>
			</Button>
			<Button
				variant="ghost"
				className={cn(
					'group aspect-square rounded-l-none p-2',
					noFocusRing,
				)}
			>
				<RepeatIcon className="h-4 w-4 text-blue-500 transition group-active:scale-75 dark:text-blue-400" />
			</Button>
		</div>
	)
}

import '@xyflow/react/dist/style.css'
import {
	ColorMode,
	EdgeTypes,
	ReactFlow,
	ReactFlowProps,
	ReactFlowProvider,
	SelectionMode,
	useReactFlow,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import { WheelEvent, useEffect, useId, useMemo } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { applyFlowNodeChanges } from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import { MAX_MUSIC_NOTE, MusicKey, MusicKeyId } from '@/lib/schemas/music'
import { filterIter, mapIter } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import { CompositionStore } from '@/stores/composition-store'
import { EditorStore } from '@/stores/editor-store'
import MusicKeyBackground from './music-key-background'
import { MusicKeyNode, musicNodeTypes } from './music-key-node'

type Props = ReactFlowProps &
	Readonly<{
		lineHeight?: number
		noteWidth?: number
		className?: string
	}>

export default function MusicKeyFlow(props: Props) {
	return (
		<ReactFlowProvider>
			<MusicFlow {...props} />
		</ReactFlowProvider>
	)
}

const edgeTypes = {} satisfies EdgeTypes

const musicKeysSelector = ({ musicKeys }: CompositionStore) => musicKeys

const selectionSelector = ({
	selectedMusicLayerId,
	musicKeySelection,
}: EditorStore) => ({ musicLayerId: selectedMusicLayerId, musicKeySelection })

const timelineScrollSelector = ({ timelineScroll }: EditorStore) =>
	timelineScroll

function MusicFlow({ noteWidth = 120, lineHeight = 24, ...props }: Props) {
	// NOTE: without unique id the viewport is shared between providers
	const flowId = useId()

	const reactFlow = useReactFlow()
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const semiquaverWidth = noteWidth / 16

	const musicKeys = useStore(compositionStore, musicKeysSelector)

	const { musicLayerId, musicKeySelection } = useStore(
		editorStore,
		useShallow(selectionSelector),
	)

	useEffect(
		() =>
			editorStore.subscribe(timelineScrollSelector, timelineScroll => {
				reactFlow.setViewport({ x: -timelineScroll, y: 0, zoom: 1 })
			}),
		[reactFlow, editorStore, lineHeight, semiquaverWidth],
	)

	const onWheel = (event: WheelEvent<HTMLDivElement>) => {
		const { scrollTimeline } = editorStore.getState()
		// TODO: workout how to handle horizontal scrolling for different mice
		const scrollX = event.shiftKey ? event.deltaY : event.deltaX
		scrollTimeline(scrollX / 2)
	}

	const nodes = useMemo(() => {
		if (!musicLayerId) {
			return []
		}

		const musicKeysOnLayer = filterIter(
			musicKeys.values(),
			musicKey => musicKey.layerId == musicLayerId,
		)

		return Array.from(
			mapIter(musicKeysOnLayer, musicKey =>
				musicKeyToNode(
					musicKey,
					musicKeySelection,
					semiquaverWidth,
					lineHeight,
				),
			),
		)
	}, [
		semiquaverWidth,
		lineHeight,
		musicKeys,
		musicKeySelection,
		musicLayerId,
	])

	// TODO: color mode isn't applied after hydration
	const { theme } = useTheme()
	const isMounted = useIsMountedState()
	const colorMode: ColorMode =
		(isMounted ? (theme as ColorMode) : null) ?? 'light'

	return (
		<ReactFlow
			id={flowId}
			nodeTypes={musicNodeTypes}
			edgeTypes={edgeTypes}
			// TODO: tsc reports that's nodes is MusicKeyNode[], but errors that
			// prop receives MusicKeyNode[] | Node[]
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
			nodes={nodes as any}
			onNodesChange={applyFlowNodeChanges.bind(
				null,
				compositionStore,
				editorStore,
			)}
			nodeOrigin={[0, 1]}
			snapToGrid
			snapGrid={[semiquaverWidth, lineHeight]}
			preventScrolling={false}
			selectionMode={SelectionMode.Partial}
			panOnDrag={false}
			onWheel={onWheel}
			colorMode={colorMode}
			{...props}
		>
			<MusicKeyBackground
				className="absolute left-0 top-0 w-full"
				lineHeight={lineHeight}
				numberOfLines={MAX_MUSIC_NOTE}
			/>
		</ReactFlow>
	)
}

function musicKeyToNode(
	musicKey: MusicKey,
	musicKeySelection: Set<MusicKeyId>,
	semiquaverWidth: number,
	lineHeight: number,
): MusicKeyNode {
	const { id, time, duration, note, instrumentId, velocity } = musicKey
	return {
		type: 'music-key',
		id,
		selected: musicKeySelection.has(musicKey.id),
		height: lineHeight,
		width: duration * semiquaverWidth,
		position: {
			x: time * semiquaverWidth,
			y: (MAX_MUSIC_NOTE - note + 1) * lineHeight,
		},
		data: { instrumentId, velocity },
	}
}

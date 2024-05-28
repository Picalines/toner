import '@xyflow/react/dist/style.css'
import {
	EdgeTypes,
	ReactFlow,
	ReactFlowProps,
	ReactFlowProvider,
	useReactFlow,
} from '@xyflow/react'
import { WheelEvent, useEffect, useId, useMemo } from 'react'
import { useStore } from 'zustand'
import { MAX_MUSIC_NOTE } from '@/lib/schemas/music'
import { filterIter, mapIter } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import { CompositionStore, MusicKey } from '@/stores/composition-store'
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

const musicLayerSelector = ({ selectedMusicLayerId }: EditorStore) =>
	selectedMusicLayerId

const timelineScrollSelector = ({ timelineScroll }: EditorStore) =>
	timelineScroll

function MusicFlow({ noteWidth = 120, lineHeight = 24, ...props }: Props) {
	// NOTE: without unique id the viewport is shared between providers
	const flowId = useId()

	const reactFlow = useReactFlow()
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const semiquaverWidth = noteWidth / 16

	const musicLayerId = useStore(editorStore, musicLayerSelector)
	const musicKeys = useStore(compositionStore, musicKeysSelector)

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
				musicKeyToNode(musicKey, semiquaverWidth, lineHeight),
			),
		)
	}, [semiquaverWidth, lineHeight, musicKeys, musicLayerId])

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

	return (
		<ReactFlow
			id={flowId}
			nodeTypes={musicNodeTypes}
			edgeTypes={edgeTypes}
			nodes={nodes}
			nodeOrigin={[0, 1]}
			snapToGrid
			snapGrid={[semiquaverWidth, lineHeight]}
			preventScrolling={false}
			panOnDrag={false}
			onWheel={onWheel}
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
	semiquaverWidth: number,
	lineHeight: number,
): MusicKeyNode {
	return {
		type: 'music-key',
		id: musicKey.id,
		height: lineHeight,
		width: musicKey.duration * semiquaverWidth,
		position: {
			x: musicKey.time * semiquaverWidth,
			y: (MAX_MUSIC_NOTE - musicKey.note + 1) * lineHeight,
		},
		data: {
			instrumentId: musicKey.instrumentId,
			velocity: musicKey.velocity,
		},
	}
}

import '@xyflow/react/dist/style.css'
import {
	type ColorMode,
	type EdgeTypes,
	ReactFlow,
	type ReactFlowProps,
	ReactFlowProvider,
	SelectionMode,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import {
	type MouseEvent,
	type WheelEvent,
	useEffect,
	useId,
	useMemo,
	useRef,
} from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { applyFlowNodeChanges } from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import {
	MAX_MUSIC_NOTE,
	type MusicKey,
	type MusicKeyId,
	type MusicLayerId,
} from '@/lib/schemas/music'
import type { CompositionStore } from '@/lib/stores/composition-store'
import type { EditorStore } from '@/lib/stores/editor-store'
import { clampLeft, mapIter, step } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import MusicFlowBackground from './music-flow-background'
import MusicKeyPreview from './music-key-preview'
import { type MusicKeyNode, musicNodeTypes } from './music-node'

type Props = ReactFlowProps &
	Readonly<{
		className?: string
	}>

export default function MusicKeyFlow(props: Props) {
	return (
		<ReactFlowProvider>
			<MusicFlow {...props} />
		</ReactFlowProvider>
	)
}

const DEFAULT_NOTE_DURATION = 4
const DEFAULT_TIME_STEP = 4
const MIN_TIME_STEP = 1

const edgeTypes = {} satisfies EdgeTypes

const musicKeysSelector = ({ musicKeys }: CompositionStore) => musicKeys

const selectionSelector = ({
	selectedMusicLayerId,
	musicKeySelection,
}: EditorStore) => ({ musicLayerId: selectedMusicLayerId, musicKeySelection })

const playbackInstrumentSelector = ({ playbackInstrumentId }: EditorStore) =>
	playbackInstrumentId

const dimensionsSelector = ({
	timelineNoteWidth,
	noteLineHeight,
}: EditorStore) => ({ timelineNoteWidth, noteLineHeight })

const timelineScrollSelector = ({ timelineScroll }: EditorStore) =>
	timelineScroll

function MusicFlow(flowProps: Props) {
	const reactFlow = useReactFlow()
	const compositionStore = useCompositionStoreApi()
	const editorStore = useEditorStoreApi()

	const { timelineNoteWidth: noteWidth, noteLineHeight } = useStore(
		editorStore,
		useShallow(dimensionsSelector),
	)

	const semiquaverWidth = noteWidth / 16

	const { musicLayerId, musicKeySelection } = useStore(
		editorStore,
		useShallow(selectionSelector),
	)

	useEffect(
		() =>
			editorStore.subscribe(timelineScrollSelector, scroll =>
				reactFlow.setViewport({ x: -scroll, y: 0, zoom: 1 }),
			),
		[reactFlow, editorStore],
	)

	const isNodeHovered = useRef(false)

	const onPaneMouseMove = (event: MouseEvent<Element>) => {
		const { playbackInstrumentId, setMusicKeyPreview } =
			editorStore.getState()

		if (playbackInstrumentId === null || isNodeHovered.current) {
			setMusicKeyPreview(null)
			return
		}

		const { timeStep, musicKeyPreview: existingPreview } =
			editorStore.getState()

		const { x, y } = reactFlow.screenToFlowPosition(
			{
				x: event.clientX,
				y: event.clientY,
			},
			{ snapToGrid: false },
		)

		const time = step(
			Math.max(0, Math.floor(x / semiquaverWidth)),
			timeStep,
		)

		if (existingPreview && event.buttons === 1) {
			const { time: startTime, note } = existingPreview
			setMusicKeyPreview({
				time: startTime,
				note,
				duration: Math.max(timeStep, time - startTime + timeStep),
			})
		} else {
			const note = clampLeft(
				MAX_MUSIC_NOTE - Math.floor(y / noteLineHeight),
				0,
				MAX_MUSIC_NOTE,
			)
			setMusicKeyPreview({ time, note, duration: DEFAULT_NOTE_DURATION })
		}
	}

	const onPaneMouseLeave = () => {
		const { setMusicKeyPreview } = editorStore.getState()
		setMusicKeyPreview(null)
	}

	const onPaneMouseClick = () => {
		const {
			musicKeyPreview,
			playbackInstrumentId: instrumentId,
			applyChange,
		} = editorStore.getState()
		if (!musicKeyPreview || !instrumentId || !musicLayerId) {
			return
		}

		const { createMusicKey } = compositionStore.getState()
		const { time, note, duration } = musicKeyPreview

		const newKey = createMusicKey(musicLayerId, instrumentId, {
			time,
			note,
			duration,
		})

		if (newKey) {
			const { id: keyId } = newKey
			applyChange({
				type: 'music-key-add',
				id: keyId,
				layerId: musicLayerId,
				instrumentId,
				time,
				note,
				duration,
				velocity: 1,
			})
		}
	}

	useEffect(
		() =>
			editorStore.subscribe(playbackInstrumentSelector, instrumentId => {
				if (!instrumentId) {
					return
				}

				const { setMusicKeyInstrument } = compositionStore.getState()
				const { musicKeySelection, applyChange } =
					editorStore.getState()

				const musicKeyIds = [...musicKeySelection]
				if (setMusicKeyInstrument(musicKeyIds, instrumentId)) {
					musicKeyIds.forEach(id =>
						applyChange({
							type: 'music-key-update',
							id,
							instrumentId,
						}),
					)
				}
			}),

		[compositionStore, editorStore],
	)

	const musicKeys = useStore(compositionStore, musicKeysSelector)

	const nodes = useMemo(
		() =>
			Array.from(
				mapIter(musicKeys.values(), musicKey =>
					musicKeyToNode(
						musicKey,
						musicLayerId,
						musicKeySelection,
						semiquaverWidth,
						noteLineHeight,
					),
				),
			),
		[
			musicKeys,
			musicLayerId,
			musicKeySelection,
			semiquaverWidth,
			noteLineHeight,
		],
	)

	useHotkeys(
		'ctrl',
		event =>
			editorStore
				.getState()
				.setTimeStep(event.ctrlKey ? MIN_TIME_STEP : DEFAULT_TIME_STEP),
		{
			keyup: true,
			keydown: true,
		},
	)

	useHotkeys('esc', () =>
		editorStore.getState().selectMusicKeys('replace', []),
	)

	const onWheel = (event: WheelEvent<HTMLDivElement>) => {
		const { scrollTimeline, zoomTimeline } = editorStore.getState()

		if (!event.ctrlKey) {
			// TODO: workout how to handle horizontal scrolling for different mice
			const scrollX = event.shiftKey ? event.deltaY : event.deltaX
			scrollTimeline(scrollX / 2)
			onPaneMouseMove(event)
		} else {
			zoomTimeline(event.deltaY > 0 ? 0.9 : 1.1)
		}
	}

	// TODO: color mode isn't applied after hydration
	const { theme } = useTheme()
	const isMounted = useIsMountedState()
	const colorMode: ColorMode =
		(isMounted ? (theme as ColorMode) : null) ?? 'light'

	// NOTE: without unique id the viewport is shared between providers
	const flowId = useId()

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
			preventScrolling={false}
			selectionMode={SelectionMode.Partial}
			panOnDrag={false}
			minZoom={1}
			maxZoom={1}
			onWheel={onWheel}
			onPaneMouseMove={onPaneMouseMove}
			onPaneMouseLeave={onPaneMouseLeave}
			onPaneClick={onPaneMouseClick}
			onNodeMouseEnter={() => (isNodeHovered.current = true)}
			onNodeMouseLeave={() => (isNodeHovered.current = false)}
			colorMode={colorMode}
			{...flowProps}
		>
			<MusicFlowBackground
				className="absolute left-0 top-0 w-full"
				lineHeight={noteLineHeight}
				numberOfLines={MAX_MUSIC_NOTE}
			/>
			<ViewportPortal>
				<MusicKeyPreview />
			</ViewportPortal>
		</ReactFlow>
	)
}

function musicKeyToNode(
	musicKey: MusicKey,
	musicLayerId: MusicLayerId | null,
	musicKeySelection: Set<MusicKeyId>,
	semiquaverWidth: number,
	lineHeight: number,
): MusicKeyNode {
	const { id, layerId, time, duration, note, instrumentId, velocity } =
		musicKey

	const isOnCurrentLayer = layerId === musicLayerId

	return {
		type: 'music-key',
		id,
		selected: musicKeySelection.has(musicKey.id),
		selectable: isOnCurrentLayer,
		focusable: isOnCurrentLayer,
		deletable: isOnCurrentLayer,
		draggable: true,
		// NOTE: reactflow places node components inside its div,
		// so we can't add pointer-events-none in MusicKeyNode
		style: {
			pointerEvents: isOnCurrentLayer ? 'auto' : 'none',
			zIndex: isOnCurrentLayer ? 0 : -10,
		},
		height: lineHeight,
		width: duration * semiquaverWidth,
		position: {
			x: time * semiquaverWidth,
			y: (MAX_MUSIC_NOTE - note) * lineHeight,
		},
		data: { isOnCurrentLayer, instrumentId, velocity },
	}
}

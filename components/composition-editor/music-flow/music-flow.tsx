import '@xyflow/react/dist/style.css'
import {
	ColorMode,
	EdgeTypes,
	ReactFlow,
	ReactFlowProps,
	ReactFlowProvider,
	SelectionMode,
	ViewportPortal,
	useReactFlow,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import {
	MouseEvent,
	WheelEvent,
	useEffect,
	useId,
	useMemo,
	useRef,
} from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { applyFlowNodeChanges } from '@/lib/editor'
import { useIsMountedState } from '@/lib/hooks'
import {
	MAX_MUSIC_NOTE,
	MusicKey,
	MusicKeyId,
	MusicLayerId,
} from '@/lib/schemas/music'
import { CompositionStore, EditorStore } from '@/lib/stores'
import { clampLeft, mapIter, step } from '@/lib/utils'
import { useCompositionStoreApi } from '@/components/providers/composition-store-provider'
import { useEditorStoreApi } from '@/components/providers/editor-store-provider'
import MusicFlowBackground from './music-flow-background'
import MusicKeyPreview from './music-key-preview'
import { MusicKeyNode, musicNodeTypes } from './music-node'

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

const DEFAULT_NOTE_DURATION = 4
const DEFAULT_TIME_STEP = 4

const edgeTypes = {} satisfies EdgeTypes

const musicKeysSelector = ({ musicKeys }: CompositionStore) => musicKeys

const selectionSelector = ({
	selectedMusicLayerId,
	musicKeySelection,
}: EditorStore) => ({ musicLayerId: selectedMusicLayerId, musicKeySelection })

const playbackInstrumentSelector = ({ playbackInstrumentId }: EditorStore) =>
	playbackInstrumentId

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
				const scroll = Math.min(timelineScroll)
				reactFlow.setViewport({ x: -scroll, y: 0, zoom: 1 })
			}),
		[reactFlow, editorStore, lineHeight, semiquaverWidth],
	)

	const isNodeHovered = useRef(false)

	const onPaneMouseMove = (event: MouseEvent<Element>) => {
		const { playbackInstrumentId, setMusicKeyPreview } =
			editorStore.getState()

		if (playbackInstrumentId === null || isNodeHovered.current) {
			setMusicKeyPreview(null)
			return
		}

		const { musicKeyPreview: existingPreview } = editorStore.getState()

		const { x, y } = reactFlow.screenToFlowPosition(
			{
				x: event.clientX,
				y: event.clientY,
			},
			{ snapToGrid: false },
		)

		const timeStep = event.ctrlKey ? 1 : DEFAULT_TIME_STEP

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
				MAX_MUSIC_NOTE - Math.floor(y / lineHeight),
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
		if (!newKey) {
			return
		}

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

	const nodes = useMemo(
		() =>
			Array.from(
				mapIter(musicKeys.values(), musicKey =>
					musicKeyToNode(
						musicKey,
						musicLayerId,
						musicKeySelection,
						semiquaverWidth,
						lineHeight,
					),
				),
			),
		[
			musicKeys,
			musicLayerId,
			musicKeySelection,
			semiquaverWidth,
			lineHeight,
		],
	)

	const onWheel = (event: WheelEvent<HTMLDivElement>) => {
		const { scrollTimeline } = editorStore.getState()
		// TODO: workout how to handle horizontal scrolling for different mice
		const scrollX = event.shiftKey ? event.deltaY : event.deltaX
		scrollTimeline(scrollX / 2)
		onPaneMouseMove(event)
	}

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
			{...props}
		>
			<MusicFlowBackground
				className="absolute left-0 top-0 w-full"
				lineHeight={lineHeight}
				numberOfLines={MAX_MUSIC_NOTE}
			/>
			<ViewportPortal>
				<MusicKeyPreview
					lineHeight={lineHeight}
					semiquaverWidth={semiquaverWidth}
				/>
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
		draggable: false, // TODO: implement note drag
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
